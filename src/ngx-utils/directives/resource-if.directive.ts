import {Directive, ViewContainerRef, TemplateRef, Input} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ResourceIfContext} from "../common-types";
import {FileUtils} from "../utils/file.utils";
import {UniversalService} from "../services/universal.service";

@Directive({
    standalone: false,
    selector: "[resourceIf]",
    exportAs: "resourceIf"
})
export class ResourceIfDirective {

    private context: ResourceIfContext;
    private resource: string;

    @Input()
    set resourceIf(resource: string) {
        this.resource = resource;
        this.renderView();
    }

    get resourceIf(): string {
        return this.resource;
    }

    get url(): string {
        return this.context.url;
    }

    constructor(private http: HttpClient, private viewContainer: ViewContainerRef, private templateRef: TemplateRef<any>, private universal: UniversalService) {
        this.context = new ResourceIfContext();
    }

    private renderView(): void {
        this.context = new ResourceIfContext();
        this.context.resource = this.resource;
        this.viewContainer.clear();
        if (this.universal.isBrowser && this.resource) {
            FileUtils.readDataFromUrl(this.http, this.resource).then(url => {
                this.context.url = url;
                this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            }, console.log);
        }
    }
}
