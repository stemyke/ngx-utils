import {
    AfterContentInit, AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from "@angular/core";
import {
    IPaginationData,
    ITableColumns,
    ITableTemplates,
    PaginationItemContext,
    TableDataLoader
} from "../../common-types";
import {ObjectUtils} from "../../utils/object.utils";
import {DynamicTableTemplateDirective} from "../../directives/dynamic-table-template.directive";
import {PaginationDirective} from "../../directives/pagination.directive";
import {UniqueUtils} from "../../utils/unique.utils";

@Component({
    moduleId: module.id,
    selector: "dynamic-table",
    templateUrl: "./dynamic-table.component.html",
})
export class DynamicTableComponent implements AfterContentInit, AfterViewInit, OnChanges {

    @Input() label: string;
    @Input() placeholder: string;
    @Input() dataLoader: TableDataLoader;
    @Input() data: any[];
    @Input() parallelData: any[];
    @Input() columns: ITableColumns | string[];
    @Input() showFilter: boolean;
    @Input() itemsPerPage: number;
    @Input() updateTime: number;
    @Input() maxPages: number;
    @Input() directionLinks: boolean;
    @Input() boundaryLinks: boolean;
    @Input() orderBy: string;
    @Input() orderDescending: boolean;

    tableId: string;
    templates: ITableTemplates;
    filter: string;
    orders: ITableColumns;
    cols: string[];

    get items(): any[] {
        return !this.pagination ? [] : this.pagination.items;
    }

    @ContentChild("rowTemplate")
    rowTemplate: TemplateRef<any>;

    @ContentChild("wrapperTemplate")
    wrapperTemplate: TemplateRef<any>;

    @ContentChild("filterTemplate")
    filterTemplate: TemplateRef<any>;

    @ViewChild("columnsTemplate")
    columnsTemplate: TemplateRef<any>;

    @ViewChild("defaultRowTemplate")
    defaultRowTemplate: TemplateRef<any>;

    @ViewChild("defaultWrapperTemplate")
    defaultWrapperTemplate: TemplateRef<any>;

    @ViewChild("defaultFilterTemplate")
    defaultFilterTemplate: TemplateRef<any>;

    @ViewChild("pagination")
    private pagination: PaginationDirective;

    @ContentChildren(DynamicTableTemplateDirective)
    private templateDirectives: QueryList<DynamicTableTemplateDirective>;

    private static compare(orderBy: string, a: PaginationItemContext, b: PaginationItemContext): number {
        a = a.item ? a.item[orderBy] : null;
        b = b.item ? b.item[orderBy] : null;
        return ObjectUtils.compare(a, b);
    }

    constructor() {
        this.dataLoader = this.loadLocalData;
        this.placeholder = "";
        this.tableId = UniqueUtils.uuid();
        this.templates = {};
        this.filter = "";
        this.orders = {};
    }

    ngAfterContentInit(): void {
        this.templates = this.templateDirectives.reduce((result, directive) => {
            if (ObjectUtils.isArray(directive.column)) {
                directive.column.forEach(column => {
                    result[column] = directive;
                });
                return result;
            }
            if (!ObjectUtils.isString(directive.column) || directive.column.length == 0) return result;
            result[directive.column] = directive;
            return result;
        }, {});
    }

    ngAfterViewInit(): void {
        this.rowTemplate = this.rowTemplate || this.defaultRowTemplate;
        this.filterTemplate = this.filterTemplate || this.defaultFilterTemplate;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.columns) {
            const columns = changes.columns.currentValue || [];
            this.orders = ObjectUtils.isArray(columns) ? columns.reduce((result, column) => {
                result[column] = column;
                return result;
            }, {}) : columns;
            this.cols = Object.keys(this.orders);
            this.orderBy = this.orderBy in this.orders ? this.orderBy : this.columns[0];
        }
        if (changes.orderBy && this.orders) {
            this.orderBy = this.orderBy in this.orders ? this.orderBy : this.columns[0];
        }
        if (!changes.data && !changes.parallelData && !changes.itemsPerPage && !changes.orderBy && !changes.orderDescending) return;
        this.refresh();
    }

    refresh(): void {
        if (!this.pagination) return;
        this.pagination.refresh();
    }

    setFilter(filter: string): void {
        this.filter = filter;
        this.refresh();
    }

    setOrder(column: string): void {
        this.orderDescending = column == this.orderBy && !this.orderDescending;
        this.orderBy = column;
        this.refresh();
    }

    loadData = (page: number, itemsPerPage: number): Promise<IPaginationData> => {
        const orderBy = this.orders[this.orderBy];
        return this.dataLoader(page, itemsPerPage, orderBy, this.orderDescending, this.filter);
    };

    private loadLocalData(page: number, rowsPerPage: number, orderBy: string, orderDescending: boolean, filter: string): Promise<IPaginationData> {
        if (!this.data) {
            return Promise.resolve({
                total: 0,
                items: []
            });
        }
        const compare: (a: any, b: any) => number = orderDescending
            ? (a, b) => DynamicTableComponent.compare(orderBy, b, a)
            : (a, b) => DynamicTableComponent.compare(orderBy, a, b);
        const from = (page - 1) * rowsPerPage;
        const dataLength = this.data.length;
        const length = Math.min(rowsPerPage, dataLength - from);
        const parallelData = this.parallelData || [];
        let data = this.data.map((item, ix) => {
            return new PaginationItemContext(item, parallelData[ix] || {}, dataLength, ix, ix);
        });
        if (ObjectUtils.isString(filter) && filter.length > 0) {
            const filterRx = new RegExp(filter, "gi");
            data = data.filter(c => c.filter(filterRx));
        }
        const items = orderBy ? data.sort(compare).splice(from, length) : data.splice(from, length);
        items.forEach((context, ix) => {
            context.index = from + ix;
        });
        return Promise.resolve({
            total: dataLength,
            items: items
        });
    }
}
