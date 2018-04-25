import {Directive, Input, OnChanges, SimpleChanges, ViewContainerRef} from "@angular/core";
import {UnorderedListTemplates, UnorederedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils";

@Directive({
    selector: "[unorderedListItem]"
})
export class UnorderedListItemDirective implements OnChanges {

    @Input("unorderedListItem") item: any;
    @Input() type: string;
    @Input() data: any;
    @Input() keyPrefix: string;
    @Input() path: string;
    @Input() level: number;
    @Input() templates: UnorederedListTemplate[];
    @Input() defaultTemplates: UnorderedListTemplates;

    isArray: boolean;
    isObject: boolean;
    valueIsObject: boolean;
    valueType: string;

    constructor(private viewContainer: ViewContainerRef) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.templates || !this.defaultTemplates || !this.item) return;
        this.path = ObjectUtils.isNullOrUndefined(this.path) ? "" : this.path.toString();
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
        this.valueIsObject = ObjectUtils.isObject(this.item.value);
        this.valueType = typeof this.item.value;
        const context: any = this;
        const template = this.templates.find(t => t.type == this.type && ObjectUtils.evaluate(t.selector, context)) || this.defaultTemplates[this.type];
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(template, context);
    }
}
