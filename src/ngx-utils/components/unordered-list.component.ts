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
import {UnorderedListTemplateDirective} from "../directives/templates";
import {ObjectUtils} from "../utils";
import {UnorderedListTemplates, UnorederedListTemplate} from "../common-types";

@Component({
    moduleId: module.id,
    selector: "unordered-list",
    template: `
        <ng-template let-keyPrefix="keyPrefix" let-key="item.key" let-isArray="isArray" #defaultKeyTemplate>
            <b *ngIf="!isArray">{{ (keyPrefix ? keyPrefix + key : key) | translate }}:</b>
        </ng-template>
        <ng-template let-keyPrefix="keyPrefix" let-val="item.value" let-path="path"
                     let-templates="templates" let-isObject="valueIsObject" #defaultValueTemplate>
            <ng-template #value>{{ val }}</ng-template>
            <unordered-list [data]="val"
                            [keyPrefix]="keyPrefix"
                            [path]="path"
                            [level]="level + 1"
                            [templates]="templates"
                            *ngIf="isObject; else value"></unordered-list>
        </ng-template>
        <ng-template let-item="item" let-data="data" let-keyPrefix="keyPrefix" let-path="path" let-level="level" let-templates="templates" #defaultItemTemplate>
            <ng-container [unorderedListItem]="item"
                          type="key"
                          [data]="data"
                          [keyPrefix]="keyPrefix"
                          [path]="path"
                          [level]="level"
                          [templates]="templates"
                          [defaultTemplates]="defaultTemplates"></ng-container>
            <ng-container [unorderedListItem]="item"
                          type="value"
                          [data]="data"
                          [keyPrefix]="keyPrefix"
                          [path]="path"
                          [level]="level"
                          [templates]="templates"
                          [defaultTemplates]="defaultTemplates"></ng-container>
        </ng-template>
        <ul *ngIf="isObject">
            <li *ngFor="let item of data | entries">
                <ng-container [unorderedListItem]="item"
                              type="item"
                              [data]="data"
                              [keyPrefix]="keyPrefix"
                              [path]="path ? path + '.' + item.key : item.key"
                              [level]="level"
                              [templates]="templates"
                              [defaultTemplates]="defaultTemplates"></ng-container>
            </li>
        </ul>
    `
})
export class UnorderedListComponent implements OnChanges, AfterContentInit, AfterViewInit {

    @Input() data: any;
    @Input() keyPrefix: string;
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
        this.path = "";
        this.level = 0;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
    }

    ngAfterContentInit(): void {
        this.templates = this.templates || this.templateDirectives.toArray();
        this.cdr.detectChanges();
    }

    ngAfterViewInit(): void {
        this.defaultTemplates = {
            key: this.defaultKeyTemplate,
            value: this.defaultValueTemplate,
            item: this.defaultItemTemplate,
        };
        this.cdr.detectChanges();
    }
}
