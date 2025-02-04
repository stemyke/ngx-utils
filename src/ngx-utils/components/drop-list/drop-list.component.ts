import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    forwardRef,
    Input,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import {DragEventHandler} from "../../common-types";
import {checkTransitions} from "../../utils/misc";
import {ObjectUtils} from "../../utils/object.utils";
import {ArrayUtils} from "../../utils/array.utils";

type DropListItem = Record<string, any>;

type DropListId = string | number;

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "drop-list",
    styleUrls: ["./drop-list.component.scss"],
    templateUrl: "./drop-list.component.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DropListComponent),
        multi: true,
    }],
})
export class DropListComponent implements OnChanges, ControlValueAccessor {

    @Input() disabled: boolean;
    @Input() unique: boolean;
    @Input() message: string;
    @Input() idField: string;
    @Input() labelField: string;
    @Input() value: DropListId[];
    @Input() context: DropListItem[];
    @Input() prepareItem: (i: DropListItem) => void;
    @Input() checkFn: DragEventHandler<boolean, "data">;
    @Input() dropFn: DragEventHandler<boolean, "data">;

    @ContentChild("itemTemplate")
    itemTemplate: TemplateRef<any>;

    onChange: Function;
    onTouched: Function;
    valueMap: Record<DropListId, DropListItem>;

    remove: (index: number) => void;

    constructor(private cdr: ChangeDetectorRef) {
        this.disabled = false;
        this.unique = false;
        this.idField = "id";
        this.labelField = "label";
        this.value = [];
        this.context = [];
        this.prepareItem = () => {};
        this.checkFn = () => false;
        this.dropFn = () => false;
        this.valueMap = {};
        this.remove = index => {
            this.changeValue(this.value.filter((_, i) => i !== index));
        };
    }

    onDragEnter(ev: DragEvent, elem: HTMLElement, data: any) {
        ev.preventDefault();
        if (!elem || !ObjectUtils.isFunction(this.checkFn) || !this.checkFn({ev, elem, data})) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none";
            return;
        }
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.dropEffect = "move";
        elem.classList.add("drop-allowed");
    }

    onDragLeave(ev: DragEvent, elem: HTMLElement) {
        ev.dataTransfer.effectAllowed = "none";
        ev.dataTransfer.dropEffect = "none";
        elem.classList.remove("drop-allowed");
    }

    onDrop(ev: DragEvent, elem: HTMLElement) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!elem) {
            return;
        }
        const data = JSON.parse(ev.dataTransfer.getData("itemData") || "{}");
        elem.classList.remove("drop-allowed");
        checkTransitions(elem, () => {
            checkTransitions(elem, () => {
                if (elem && ObjectUtils.isFunction(this.dropFn) && this.dropFn({ev, elem, data})) {
                    // If drop is handled from outside function
                    return;
                }
                const id = data[this.idField] || data.id;
                this.changeValue(this.value.concat([id]));
            });
            elem.classList.remove("dropped");
        });
        elem.classList.add("dropped");
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.context || changes.idField) {
            this.valueMap = this.context?.reduce((res, item) => {
                // In case this is a dynamic form option which stores real value under props
                item = Object.assign({}, item, item.props || {});
                // Prepare item
                this.prepareItem(item);

                const id = item[this.idField] || item.id;
                res[id] = item;
                return res;
            }, {}) || {};
            this.cdr.detectChanges();
        }
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val === true;
        this.cdr.markForCheck();
    }

    writeValue(obj: any): void {
        this.value = Array.isArray(obj) ? obj : this.value;
        this.cdr.detectChanges();
    }

    protected changeValue(value: DropListId[]): void {
        this.value = this.unique ? ArrayUtils.unique(value) : value;
        this.onChange?.(value);
        this.onTouched?.();
    }
}
