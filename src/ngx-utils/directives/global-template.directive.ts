import {Directive, Input, OnDestroy, OnInit, TemplateRef} from "@angular/core";
import {GlobalTemplateService} from "../services/global-template.service";

@Directive({
    selector: "[globalTemplate]"
})
export class GlobalTemplateDirective implements OnInit, OnDestroy {

    @Input("globalTemplate") id: string;

    constructor(public readonly globalTemplateService: GlobalTemplateService,
                public readonly template: TemplateRef<any>) {

    }

    ngOnInit(): void {
        this.globalTemplateService.add(this.id, this.template);
    }

    ngOnDestroy(): void {
        this.globalTemplateService.remove(this.id);
    }
}
