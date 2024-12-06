import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, ViewContainerRef} from "@angular/core";
import {UnorderedListStyle, UnorderedListTemplates, UnorderedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {StringUtils} from "../utils/string.utils";

@Directive({
    standalone: false,
    selector: "[unorderedListItem]"
})
export class UnorderedListItemDirective implements OnChanges {

    @Input("unorderedListItem") item: any;
    @Input() type: string;
    @Input() data: any;
    @Input() keyPrefix: string;
    @Input() listStyle: UnorderedListStyle;
    @Input() path: string;
    @Input() level: number;
    @Input() templates: UnorderedListTemplate[];
    @Input() defaultTemplates: UnorderedListTemplates;

    isArray: boolean;
    isObject: boolean;
    valueIsArray: boolean;
    valueIsObject: boolean;
    valueType: string;

    get elem(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private viewContainer: ViewContainerRef) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.templates || !this.defaultTemplates || !this.item) return;
        const promise = this.item.value instanceof Promise ? this.item.value : Promise.resolve(this.item.value);
        promise.then(value => {
            this.item.value = value;
            this.path = ObjectUtils.isNullOrUndefined(this.path) ? "" : this.path.toString();
            this.isArray = ObjectUtils.isArray(this.data);
            this.isObject = ObjectUtils.isObject(this.data);
            this.valueIsArray = ObjectUtils.isArray(this.item.value);
            this.valueIsObject = ObjectUtils.isObject(this.item.value);
            this.valueType = ObjectUtils.getType(this.item.value);
            const context: any = this;
            const template = this
                .templates
                .find(t => t.type == this.type && ObjectUtils.evaluate(t.selector, context))?.templateRef || this.defaultTemplates[this.type];
            // Set view
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(template, context);
            // Set classes
            if (this.type !== "item") return;
            this.item.classList = [];
            this.isClass("is-array", this.valueIsArray);
            this.isClass("is-object", this.valueIsObject);
            this.isClass("is-value", !this.valueIsObject && !this.valueIsArray);
            this.isClass(`type-${this.valueType}`);
            this.isClass(`path-${this.path.replace(/\./g, "-")}`);
            this.isClass(`key-${this.item.key}`);
        }, reason => {
            console.log("Can't handle promise rejection", reason);
        });
    }

    private isClass(className: string, value: boolean = true): void {
        if (!value) return;
        this.item.classList.push(className);
    }
}
