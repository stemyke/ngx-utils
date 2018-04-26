import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, ViewContainerRef} from "@angular/core";
import {UnorderedListStyle, UnorderedListTemplates, UnorederedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils";

@Directive({
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
    @Input() templates: UnorederedListTemplate[];
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
        const prevType = this.valueType;
        this.path = ObjectUtils.isNullOrUndefined(this.path) ? "" : this.path.toString();
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
        this.valueIsArray = ObjectUtils.isArray(this.item.value);
        this.valueIsObject = ObjectUtils.isObject(this.item.value);
        this.valueType = typeof this.item.value;
        const context: any = this;
        const template = this.templates.find(t => t.type == this.type && ObjectUtils.evaluate(t.selector, context)) || this.defaultTemplates[this.type];
        // Set view
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(template, context);
        // Set classes
        if (this.type !== "item") return;
        this.isClass(this.valueIsArray, "is-array");
        this.isClass(this.valueIsObject, "is-object");
        this.isClass(!this.valueIsObject, "is-value");
        this.renderer.removeClass(this.elem.parentElement, `type-${prevType}`);
        this.renderer.addClass(this.elem.parentElement, `type-${this.valueType}`);
    }

    private isClass(value: boolean, className: string): void {
        if (value) {
            this.renderer.addClass(this.elem.parentElement, className);
            return;
        }
        this.renderer.removeClass(this.elem.parentElement, className);
    }
}
