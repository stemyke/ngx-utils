import {Component, computed, model, untracked, viewChild, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {AutoPlacementOptions} from "@floating-ui/dom";
import {isDate} from "../../utils/object.utils";
import {convertToDateFormat, findClosestValidDate, parseValidDate} from "../../utils/date.utils";
import {CalendarInputs} from "../calendar/calendar-inputs";
import {DropdownDirective} from "../../directives/dropdown.directive";
import {ControlValueAccesFn} from "../../common-types";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "date-picker",
    templateUrl: "./date-picker.component.html",
    styleUrls: ["./date-picker.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: DatePickerComponent, multi: true}
    ],
})
export class DatePickerComponent extends CalendarInputs implements ControlValueAccessor {

    readonly disabled = model(false);

    readonly autoPlacement: AutoPlacementOptions = {
        autoAlignment: true,
        allowedPlacements: ["top-end", "bottom-end"]
    };

    readonly inputValue = computed(() => {
        const value = this.validatedValue();
        return isDate(value) ? convertToDateFormat(value, "date") : String(this.value() || "");
    });

    readonly pickerDropdown = viewChild<DropdownDirective>("pickerDropdown");

    onChange: ControlValueAccesFn<Date | Date[] | string | null> = () => {
    };
    onTouched: ControlValueAccesFn = () => {
    };

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    writeValue(value: Date) {
        this.value.set(value);
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled.set(isDisabled);
    }

    onPickerChange(date: any) {
        this.value.set(date);
        untracked(() => {
            this.pickerDropdown()?.hide();
        });
        this.onChange(date);
        this.onTouched();
    }

    onFocus(): void {
        untracked(() => {
            this.pickerDropdown()?.hide();
        });
    }

    onBlur(ev: FocusEvent): void {
        const target = ev.target as HTMLInputElement;
        let date = parseValidDate(target.value);
        let value: Date | string = date;
        untracked(() => {
            const strict = this.strict();
            const min = this.minDate();
            const max = this.maxDate();
            const disabledTimes = this.disabledTimestamps();
            const disabledDays = this.disabledDays();
            date = date
                ? findClosestValidDate(date, min, max, disabledTimes, disabledDays)
                : null;
            target.value = isDate(date)
                ? convertToDateFormat(date, "date")
                : (strict ? null : target.value);
            value = isDate(date)
                ? date
                : (strict ? null : target.value);
        });
        this.value.set(value);
        this.onChange(value);
        this.onTouched();
    }

    clear(): void {
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
}
