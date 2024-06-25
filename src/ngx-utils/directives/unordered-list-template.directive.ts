import {Directive, Input, TemplateRef} from "@angular/core";
import {UnorderedListTemplate} from "../common-types";

@Directive({
    selector: "ng-template[type][selector]"
})

export class UnorderedListTemplateDirective implements UnorderedListTemplate {

    @Input() type: string;
    @Input() selector: string;

    constructor(readonly templateRef: TemplateRef<any>) {

    }
}
