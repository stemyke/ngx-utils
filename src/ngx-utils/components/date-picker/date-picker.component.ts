import {Component, computed, input, untracked, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {AutoPlacementOptions} from "@floating-ui/dom";
import {isDate} from "../../utils/object.utils";
import {convertToDateFormat, findClosestValidDate, parseValidDate} from "../../utils/date.utils";
import {CalendarInputs} from "../calendar/calendar-inputs";

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

    readonly testId = input("date-picker");
    readonly datePattern = "^\\d{4}-\\d{2}-\\d{2}$";

    readonly autoPlacement: AutoPlacementOptions = {
        autoAlignment: true,
        allowedPlacements: ["top-end", "bottom-end"]
    };

    readonly inputValue = computed(() => {
        const value = this.validatedValue();
        return isDate(value) ? convertToDateFormat(value, "date") : String(this.value() || "");
    });

    onChange: any = () => { };
    onTouched: any = () => { };

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
        this.onChange(date);
        this.onTouched();
    }

    onBlur(ev: FocusEvent): void {
        const target = ev.target as HTMLInputElement;
        let date = parseValidDate(target.value);
        untracked(() => {
            const strict = this.strict();
            if (strict) {
                const min = this.minDate();
                const max = this.maxDate();
                const disabledTimes = this.disabledTimestamps();
                const disabledDays = this.disabledDays();
                date = findClosestValidDate(date, min, max, disabledTimes, disabledDays);
            }
        });
        target.value = isDate(date) ? convertToDateFormat(date, "date") : String(target.value || "");
        this.value.set(isDate(date) ? date : target.value || null);
        this.onChange(date);
        this.onTouched();
    }
}
