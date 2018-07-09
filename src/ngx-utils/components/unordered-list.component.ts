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
import {UnorderedListStyle, UnorderedListTemplates, UnorederedListTemplate} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {UnorderedListTemplateDirective} from "../directives/unordered-list-template.directive";

@Component({
    moduleId: module.id,
    selector: "unordered-list",
    template: `
        <ng-template let-keyPrefix="keyPrefix" let-key="item.key" let-isArray="isArray" #defaultKeyTemplate>
            {{ (keyPrefix ? keyPrefix + key : key) | translate }}:
        </ng-template>
        <ng-template let-keyPrefix="keyPrefix" let-listStyle="listStyle" let-val="item.value" let-path="path"
                     let-templates="templates" let-isObject="valueIsObject" #defaultValueTemplate>
            <ng-template #value>{{ val }}</ng-template>
            <unordered-list [data]="val"
                            [keyPrefix]="keyPrefix"
                            [listStyle]="listStyle"
                            [path]="path"
                            [level]="level + 1"
                            [templates]="templates"
                            *ngIf="isObject; else value"></unordered-list>
        </ng-template>
        <ng-template let-item="item" let-data="data" let-keyPrefix="keyPrefix" let-listStyle="listStyle" let-path="path" let-level="level" let-templates="templates" #defaultItemTemplate>
            <ng-template #itemKey>
                <ng-container [unorderedListItem]="item"
                              type="key"
                              [data]="data"
                              [keyPrefix]="keyPrefix"
                              [listStyle]="listStyle"
                              [path]="path"
                              [level]="level"
                              [templates]="templates"
                              [defaultTemplates]="defaultTemplates"></ng-container>
            </ng-template>
            <ng-template #itemValue>
                <ng-container [unorderedListItem]="item"
                              type="value"
                              [data]="data"
                              [keyPrefix]="keyPrefix"
                              [listStyle]="listStyle"
                              [path]="path"
                              [level]="level"
                              [templates]="templates"
                              [defaultTemplates]="defaultTemplates"></ng-container>
            </ng-template>
            <ng-container *ngIf="!isArray">
                <th *ngIf="listStyle == 'table'; else itemKey">
                    <ng-container [ngTemplateOutlet]="itemKey"></ng-container>
                </th>
            </ng-container>
            <td *ngIf="listStyle == 'table'; else itemValue">
                <ng-container [ngTemplateOutlet]="itemValue"></ng-container>      
            </td>
        </ng-template>
                
        <ng-template #value>
            {{ data }}
        </ng-template>
        <ng-container *ngIf="isObject; else value" [ngSwitch]="listStyle">
            <ul [ngClass]="'level-' + level" *ngSwitchCase="'list'">
                <li *ngFor="let item of data | entries">
                    <ng-container [unorderedListItem]="item"
                                  type="item"
                                  [data]="data"
                                  [keyPrefix]="keyPrefix"
                                  [listStyle]="listStyle"
                                  [path]="path ? path + '.' + item.key : item.key"
                                  [level]="level"
                                  [templates]="templates"
                                  [defaultTemplates]="defaultTemplates"></ng-container>
                </li>
            </ul>
            <table [ngClass]="'level-' + level" *ngSwitchDefault>
                <tr *ngFor="let item of data | entries">
                    <ng-container [unorderedListItem]="item"
                                  type="item"
                                  [data]="data"
                                  [keyPrefix]="keyPrefix"
                                  [listStyle]="listStyle"
                                  [path]="path ? path + '.' + item.key : item.key"
                                  [level]="level"
                                  [templates]="templates"
                                  [defaultTemplates]="defaultTemplates"></ng-container>
                </tr>
            </table>
        </ng-container>
    `
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
        const templates: UnorederedListTemplate[] = this.templateDirectives.toArray();
        this.templates = templates.concat(this.templates || []);
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
