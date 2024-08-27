import {Directive, Input, OnDestroy, OnInit, TemplateRef} from "@angular/core";
import {GlobalTemplateService} from "../services/global-template.service";

@Directive({
    selector: "[globalTemplate]"
})
export class GlobalTemplateDirective implements OnInit, OnDestroy {

    @Input("globalTemplate") id: string;

    constructor(readonly globalTemplates: GlobalTemplateService,
                readonly template: TemplateRef<any>) {

    }

    ngOnInit(): void {
        this.globalTemplates.add(this.id, this.template);
    }

    ngOnDestroy(): void {
        this.globalTemplates.remove(this.id);
    }
}
