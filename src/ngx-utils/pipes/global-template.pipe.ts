import {OnDestroy, OnInit, Pipe, PipeTransform, TemplateRef} from "@angular/core";
import {Subscription} from "rxjs";
import {GlobalTemplateService} from "../services/global-template.service";

@Pipe({
    standalone: false,
    pure: false,
    name: "globalTemplate"
})
export class GlobalTemplatePipe implements PipeTransform, OnInit, OnDestroy {

    protected templatesUpdated: Subscription;

    protected cachedTemplateId: string;
    protected cachedTemplate: TemplateRef<any>;

    constructor(protected globalTemplates: GlobalTemplateService) {
        this.cachedTemplateId = null;
        this.cachedTemplate = null;
    }

    ngOnInit(): void {
        this.templatesUpdated = this.globalTemplates.templatesUpdated.subscribe(() => {
            this.cachedTemplate = null;
        });
    }

    ngOnDestroy(): void {
        if (this.templatesUpdated)
            this.templatesUpdated.unsubscribe();
    }

    transform(templateId: string, component?: any): TemplateRef<string> {
        if (!templateId) return null;
        if (this.cachedTemplate === null || this.cachedTemplateId !== templateId) {
            this.cachedTemplateId = templateId;
            this.cachedTemplate = this.globalTemplates.get(templateId, component);
        }
        return this.cachedTemplate;
    }
}
