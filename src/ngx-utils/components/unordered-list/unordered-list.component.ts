import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges, TemplateRef, ViewChild
} from "@angular/core";
import {UnorderedListStyle, UnorderedListTemplates, UnorederedListTemplate} from "../../common-types";
import {ObjectUtils} from "../../utils/object.utils";
import {UnorderedListTemplateDirective} from "../../directives/unordered-list-template.directive";

@Component({
    selector: "unordered-list",
    templateUrl: "./unordered-list.component.html"
})
export class UnorderedListComponent implements OnChanges, AfterContentInit, AfterViewInit {

    @Input() data: any;
    @Input() keyPrefix: string;
    @Input() listStyle: UnorderedListStyle;
    @Input() path: string;
    @Input() level: number;
    @Input() templates: UnorederedListTemplate[];

    isArray: boolean;
    isObject: boolean;
    defaultTemplates: UnorderedListTemplates;

    @ContentChildren(UnorderedListTemplateDirective)
    private templateDirectives: QueryList<UnorderedListTemplateDirective>;

    @ViewChild("defaultKeyTemplate")
    private defaultKeyTemplate: TemplateRef<any>;
    @ViewChild("defaultValueTemplate")
    private defaultValueTemplate: TemplateRef<any>;
    @ViewChild("defaultItemTemplate")
    private defaultItemTemplate: TemplateRef<any>;

    constructor(private cdr: ChangeDetectorRef) {
        this.keyPrefix = "";
        this.listStyle = "table";
        this.path = "";
        this.level = 0;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
    }

    ngAfterContentInit(): void {
        const templates = this.templateDirectives.toArray();
        this.templates = this.templates ? this.templates.concat(templates) : templates;
        this.cdr.detectChanges();
    }

    ngAfterViewInit(): void {
        this.defaultTemplates = {
            key: this.defaultKeyTemplate,
            value: this.defaultValueTemplate,
            item: this.defaultItemTemplate
        };
        this.cdr.detectChanges();
    }
}
