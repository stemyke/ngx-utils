import {Directive, Input, TemplateRef} from "@angular/core";
import {ITableTemplate} from "../common-types";

@Directive({
    standalone: false,
    selector: "ng-template[column]"
})

export class DynamicTableTemplateDirective implements ITableTemplate {

    @Input() column: string | string[];
    @Input() pure: boolean;

    constructor(public ref: TemplateRef<any>) {
    }
}
