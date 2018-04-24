import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges
} from "@angular/core";
import {UnorderedListTemplateDirective} from "../directives/templates";
import {ObjectUtils} from "../utils";
import {UnorederedListTemplate} from "../common-types";

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
            <unordered-list [keyPrefix]="keyPrefix"
                            [path]="path"
                            [data]="val"
                            [templates]="templates"
                            *ngIf="isObject; else value"></unordered-list>
        </ng-template>
        <ng-template let-keyPrefix="keyPrefix" let-item="item" let-path="path" let-data="data" let-templates="templates" #defaultItemTemplate>
            <ng-container [unorderedListItem]="item"
                          [keyPrefix]="keyPrefix"
                          [path]="path"
                          [data]="data"
                          [templates]="templates"
                          [defaultTemplate]="defaultKeyTemplate"
                          type="key"></ng-container>
            <ng-container [unorderedListItem]="item"
                          [keyPrefix]="keyPrefix"
                          [path]="path"
                          [data]="data"
                          [templates]="templates"
                          [defaultTemplate]="defaultValueTemplate"
                          type="value"></ng-container>
        </ng-template>
        <ul *ngIf="isObject">
            <li *ngFor="let item of data | entries">
                <ng-container [unorderedListItem]="item"
                              [keyPrefix]="keyPrefix"
                              [path]="path ? path + '.' + item.key : item.key"
                              [data]="data"
                              [templates]="templates"
                              [defaultTemplate]="defaultItemTemplate"
                              type="item"></ng-container>
            </li>
        </ul>
    `
})
export class UnorderedListComponent implements OnChanges, AfterViewInit {

    @Input() keyPrefix: string;
    @Input() path: string;
    @Input() data: any;
    @Input() templates: UnorederedListTemplate[];

    isArray: boolean;
    isObject: boolean;

    @ContentChildren(UnorderedListTemplateDirective)
    templateDirectives: QueryList<UnorderedListTemplateDirective>;

    constructor(private cdr: ChangeDetectorRef) {
        this.keyPrefix = "";
        this.path = "";
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
    }

    ngAfterViewInit(): void {
        this.templates = this.templates || this.templateDirectives.toArray();
        this.cdr.detectChanges();
    }
}
