import {Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef} from "@angular/core";
import {UnorederedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils";

@Directive({
    selector: "[unorderedListItem]"
})
export class UnorderedListItemDirective implements OnChanges {

    @Input("unorderedListItem") item: any;
    @Input() type: string;
    @Input() keyPrefix: string;
    @Input() path: string;
    @Input() data: any;
    @Input() templates: UnorederedListTemplate[];
    @Input() defaultTemplate: TemplateRef<any>;

    isArray: boolean;
    isObject: boolean;
    valueIsObject: boolean;
    valueType: string;

    constructor(private viewContainer: ViewContainerRef) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.templates || !this.item) return;
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
        this.valueIsObject = ObjectUtils.isObject(this.item.value);
        this.valueType = typeof this.item.value;
        const template = this.templates.find(t => t.type == this.type && ObjectUtils.evaluate(t.selector, this)) || this.defaultTemplate;
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(template, this);
    }
}
