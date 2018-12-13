import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, ViewContainerRef} from "@angular/core";
import {UnorderedListStyle, UnorderedListTemplates, UnorederedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {StringUtils} from "../utils/string.utils";

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
            const template = this.templates.find(t => t.type == this.type && ObjectUtils.evaluate(t.selector, context)) || this.defaultTemplates[this.type];
            // Set view
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(template, context);
            // Set classes
            if (this.type !== "item") return;
            this.isClass(this.valueIsArray, "is-array");
            this.isClass(this.valueIsObject, "is-object");
            this.isClass(!this.valueIsObject && !this.valueIsArray, "is-value");
            const parent = this.elem.parentElement;
            const classes = Array.from(parent.classList);
            classes.forEach(cls => {
                if (!StringUtils.startsWith(cls, "type-", "path-", "key-")) return;
                this.renderer.removeClass(parent, cls);
            });
            this.renderer.addClass(this.elem.parentNode, `type-${this.valueType}`);
            this.renderer.addClass(this.elem.parentNode, `path-${this.path.replace(/\./g, "-")}`);
            this.renderer.addClass(this.elem.parentNode, `key-${this.item.key}`);
        }, reason => {
            console.log("Can't handle promise rejection", reason);
        });
    }

    private isClass(value: boolean, className: string): void {
        if (value) {
            this.renderer.addClass(this.elem.parentNode, className);
            return;
        }
        this.renderer.removeClass(this.elem.parentNode, className);
    }
}
