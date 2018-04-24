import {Directive, ElementRef, EmbeddedViewRef, Input, TemplateRef} from "@angular/core";
import {UnorederedListTemplate} from "../common-types";

@Directive({
    selector: "ng-template[type][selector]"
})

export class UnorderedListTemplateDirective implements UnorederedListTemplate {

    @Input() type: string;
    @Input() selector: string;

    constructor(public elementRef: ElementRef, public templateRef: TemplateRef<any>) {
    }

    createEmbeddedView(context: any): EmbeddedViewRef<any> {
        return this.templateRef.createEmbeddedView(context);
    }
}
