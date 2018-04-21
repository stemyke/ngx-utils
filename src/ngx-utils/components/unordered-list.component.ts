import {Component, Input, OnChanges, SimpleChanges, TemplateRef} from "@angular/core";
import {ObjectUtils} from "../utils";

@Component({
    moduleId: module.id,
    selector: "unordered-list",
    template: `
        <ng-template #defaultKeyTemplate let-key="key">
            <b *ngIf="!isArray">{{ (keyPrefix ? keyPrefix + key : key) | translate }}:</b>
        </ng-template>
        <ng-template #defaultValueTemplate>
            {{ data }}
        </ng-template>
        <ng-template #value>
            <ng-container [ngTemplateOutlet]="valueTemplate || defaultValueTemplate" [ngTemplateOutletContext]="this">

            </ng-container>
        </ng-template>
        <ul *ngIf="isObject; else value">
            <li *ngFor="let item of data | entries">
                <ng-container [ngTemplateOutlet]="keyTemplate || defaultKeyTemplate"
                              [ngTemplateOutletContext]="{item: item, key: item.key, keyPrefix: keyPrefix, path: path}"></ng-container>
                <unordered-list [data]="item.value" [keyPrefix]="keyPrefix" [keyTemplate]="keyTemplate"
                                [valueTemplate]="valueTemplate" [key]="item.key"
                                [path]="path ? path + '.' + item.key : item.key"></unordered-list>
            </li>
        </ul>
    `
})
export class UnorderedListComponent implements OnChanges {

    @Input() data: any;
    @Input() keyPrefix: string;
    @Input() keyTemplate: TemplateRef<any>;
    @Input() valueTemplate: TemplateRef<any>;

    @Input() key: string;
    @Input() path: string;

    isArray: boolean;
    isObject: boolean;

    constructor() {
        this.keyPrefix = "";
        this.key = "";
        this.path = "";
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isArray = ObjectUtils.isArray(this.data);
        this.isObject = ObjectUtils.isObject(this.data);
    }
}
