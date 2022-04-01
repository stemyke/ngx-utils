import {Directive, Inject, Input, OnDestroy, OnInit, TemplateRef} from "@angular/core";
import {GLOBAL_TEMPLATES, IGlobalTemplates} from "../common-types";

@Directive({
    selector: "[globalTemplate]"
})
export class GlobalTemplateDirective implements OnInit, OnDestroy {

    @Input("globalTemplate") id: string;

    constructor(@Inject(GLOBAL_TEMPLATES) readonly globalTemplates: IGlobalTemplates,
                readonly template: TemplateRef<any>) {

    }

    ngOnInit(): void {
        this.globalTemplates.add(this.id, this.template);
    }

    ngOnDestroy(): void {
        this.globalTemplates.remove(this.id);
    }
}
