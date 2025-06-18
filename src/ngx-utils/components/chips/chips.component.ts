import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input, OnChanges,
    Output, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ObjectUtils} from "../../utils/object.utils";
import {ChipOption, ChipStatus, ChipValue} from "../../common-types";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "chips",
    templateUrl: "./chips.component.html",
    styleUrls: ["./chips.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: ChipsComponent, multi: true}
    ],
})
export class ChipsComponent implements ControlValueAccessor, OnChanges {

    @Input() value: ChipValue | ChipValue[];
    @Input() multiple: boolean;
    @Input() disabled: boolean;
    @Input() type: string;
    @Input() min: number;
    @Input() max: number;
    @Input() minLength: number;
    @Input() maxLength: number;
    @Input() step: number;
    @Input() placeholder: string;
    @Input() unique: boolean;
    @Input() options: ReadonlyArray<ChipOption>;

    @Output() valueChange: EventEmitter<ChipValue | ChipValue[]>;

    @ViewChild("chipContainer")
    chipContainer: ElementRef<HTMLDivElement>;

    @ViewChild("chipButtons")
    chipButtons: ElementRef<HTMLDivElement>;

    @ViewChild("chipInput")
    chipInput: ElementRef<HTMLInputElement>;

    inputStyles: { [key: string]: string };
    valueOptions: ChipOption[];
    filteredOptions: ChipOption[];
    statuses: ChipStatus[];

    private undoList: Function[];
    private previousValue: string;

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(readonly cdr: ChangeDetectorRef) {
        this.value = [];
        this.multiple = true;
        this.statuses = [];
        this.disabled = false;
        this.type = "text";
        this.min = -999999999;
        this.max = 999999999;
        this.minLength = 0;
        this.maxLength = this.max;
        this.step = 1;
        this.placeholder = "";
        this.unique = false;
        this.valueChange = new EventEmitter();
        this.inputStyles = {};
        this.valueOptions = [];
        this.filteredOptions = [];
        this.undoList = [];
        this.previousValue = "";
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value) {
            const value = changes.value.currentValue;
            this.valueOptions = this.createValueOptions(Array.isArray(value) ? value : [value]);
            this.value = this.updateValue();
        }
        this.filterOptions();
    }

    writeValue(value: ChipValue | ChipValue[]) {
        this.valueOptions = this.createValueOptions(Array.isArray(value) ? value : [value]);
        this.value = this.updateValue();
        this.filterOptions();
        this.cdr.markForCheck();
    }

    updateValues(val: ChipOption[]): void {
        this.valueOptions = Array.from(val);
        this.value = this.updateValue();
        this.onChange(this.value);
        this.valueChange.emit(this.value);
        this.filterOptions();
        this.cdr.markForCheck();
    }

    setDisabledState(val: boolean) {
        this.disabled = val === true;
        this.cdr.markForCheck();
    }

    removeItem(event: Event, ix: number): void {
        event.stopPropagation();
        if (this.disabled) return;
        this.makeUndo();
        this.updateValues(this.valueOptions.filter((v, i) => i !== ix));
        this.onTouched(this.value);
        this.chipInput.nativeElement.focus();
    }

    onResize(): void {
        const container = this.chipContainer.nativeElement;
        const buttons = this.chipButtons.nativeElement;
        const style = getComputedStyle(buttons);
        const vertical = parseFloat(style.top);
        const horizontal = parseFloat(style.gap);
        this.inputStyles = buttons.offsetWidth > container.offsetWidth * .7
            ? {
                paddingTop: `${buttons.offsetHeight + vertical}px`,
                paddingLeft: `0px`
            } : {
                paddingLeft: `${buttons.offsetWidth + horizontal}px`,
                lineHeight: `${buttons.offsetHeight - vertical * 2}px`
            };
    }

    onInput(ev: KeyboardEvent): boolean {
        const input = ev.target as HTMLInputElement;
        const changed = input.value !== this.previousValue;
        this.previousValue = input.value;
        if (ev.ctrlKey) {
            if (ev.key == "z") {
                const fn = this.undoList.pop();
                if (ObjectUtils.isFunction(fn)) {
                    fn();
                }
                return false;
            }
            return false;
        }
        if (ev.key == "Enter") {
            return this.enterOption(input.value);
        }
        if (ev.key == "Backspace" && !input.value && !changed && this.valueOptions.length > 0) {
            this.makeUndo();
            this.updateValues(this.valueOptions.slice(0, this.valueOptions.length - 1));
            this.onTouched(this.value);
            return false;
        }
        this.filterOptions();
        return true;
    }

    onBlur(ev: FocusEvent): void {
        const input = ev.target as HTMLInputElement;
        this.enterOption(input.value);
    }

    enterOption(value: string): boolean {
        let option = this.createOption(value);
        if (!option && this.filteredOptions?.length === 1) {
            const regex = new RegExp(value, "gi");
            option = this.filteredOptions.find(o => o.label?.match(regex));
        }
        if (!option || (this.unique && this.valueOptions.findIndex(o => o.value === option.value) >= 0)) {
            return true;
        }
        this.makeUndo();
        this.updateValues(this.multiple ? this.valueOptions.concat(option) : [option]);
        this.onTouched(this.value);
        const input = this.chipInput?.nativeElement;
        if (input) {
            input.value = "";
            setTimeout(input.focus.bind(input), 500);
        }
        return false;
    }

    trackBy(index: number, option: ChipOption): string {
        return `${option.value}-${option.label}`;
    }

    protected makeUndo(): void {
        const value = this.valueOptions;
        this.undoList.push(() => this.updateValues(value));
    }

    protected createOption(value: string | number): ChipOption {
        const label = String(value);
        if (this.options) {
            const option =
                this.options.find(o => o.label === label) ||
                this.options.find(o => o.value === value);
            return option ?? null;
        }
        return !label ? null : {
            value,
            label,
        };
    }

    protected createValueOptions(values: ChipValue[]): ChipOption[] {
        values = values.filter(ObjectUtils.isDefined).map(v => {
            if (this.type == "number") {
                v = String(v || "0").replace(/([^-\d|.,])/gi, "").replace(/\./gi, ",");
                const value = Math.round((parseFloat(v.replace(/,/gi, ".")) || 0) / this.step) * this.step;
                return Math.min(this.max, Math.max(this.min, value));
            }
            return String(v || "0").substring(0, this.maxLength);
        });
        const options = values.map(id => {
            return this.createOption(id);
        }).filter(o => !!o);
        return this.multiple ? options : options.slice(0, 1);
    }

    protected updateValue(): ChipValue | ChipValue[] {
        this.statuses = this.valueOptions.map(o => {
            if (this.type == "number") {
                return Number(o.value) < this.min ? "invalid" : "valid";
            }
            return String(o.value).length < this.minLength ? "invalid" : "valid";
        });
        return this.multiple
            ? this.valueOptions.map(o => o.value)
            : this.valueOptions[0]?.value ?? null;
    }

    protected filterOptions(): void {
        if (!this.options) {
            this.filteredOptions = null;
            return;
        }
        const value = (this.chipInput?.nativeElement?.value || "").toLowerCase();
        this.filteredOptions = this.options.filter(o => {
            return o.label?.toLowerCase().includes(value);
        });
        if (!this.unique) return;
        const values = this.valueOptions.map(o => o.value);
        this.filteredOptions = this.filteredOptions.filter(o => !values.includes(o.value));
    }
}
