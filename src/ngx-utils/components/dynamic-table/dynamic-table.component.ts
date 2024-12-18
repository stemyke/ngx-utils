import {
    AfterContentInit,
    AfterViewInit,
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
    DynamicTableDragHandler,
    IPaginationData,
    ITableColumns,
    ITableDataQuery,
    ITableTemplates,
    PaginationItemContext,
    TableColumns,
    TableDataLoader
} from "../../common-types";
import {ObjectUtils} from "../../utils/object.utils";
import {DynamicTableTemplateDirective} from "../../directives/dynamic-table-template.directive";
import {PaginationDirective} from "../../directives/pagination.directive";
import {UniqueUtils} from "../../utils/unique.utils";

@Component({
    standalone: false,
    selector: "dynamic-table",
    templateUrl: "./dynamic-table.component.html",
})
export class DynamicTableComponent implements AfterContentInit, AfterViewInit, OnChanges {

    @Input() label: string;
    @Input() placeholder: string;
    @Input() dataLoader: TableDataLoader;
    @Input() data: any[];
    @Input() page: number;
    @Input() urlParam: string;
    @Input() parallelData: any[];
    @Input() columns: TableColumns;
    @Input() showFilter: boolean;
    @Input() itemsPerPage: number;
    @Input() updateTime: number;
    @Input() filterTime: number;
    @Input() maxPages: number;
    @Input() directionLinks: boolean;
    @Input() boundaryLinks: boolean;
    @Input() orderBy: string;
    @Input() orderDescending: boolean;
    @Input() testId: string;
    @Input() titlePrefix: string;
    @Input() dragStartFn: DynamicTableDragHandler;
    @Input() dragEnterFn: DynamicTableDragHandler;
    @Input() dropFn: DynamicTableDragHandler;

    tableId: string;
    templates: ITableTemplates;
    filter: string;
    query: ITableDataQuery;
    hasQuery: boolean;
    realColumns: ITableColumns;
    cols: string[];

    get items(): any[] {
        return !this.pagination ? [] : this.pagination.items;
    }

    @ContentChild("rowTemplate", {static: true})
    rowTemplate: TemplateRef<any>;

    @ContentChild("wrapperTemplate", {static: true})
    wrapperTemplate: TemplateRef<any>;

    @ContentChild("filterTemplate", {static: true})
    filterTemplate: TemplateRef<any>;

    @ViewChild("columnsTemplate", {static: true})
    columnsTemplate: TemplateRef<any>;

    @ViewChild("defaultRowTemplate", {static: true})
    defaultRowTemplate: TemplateRef<any>;

    @ViewChild("defaultWrapperTemplate", {static: true})
    defaultWrapperTemplate: TemplateRef<any>;

    @ViewChild("defaultFilterTemplate", {static: true})
    defaultFilterTemplate: TemplateRef<any>;

    @ViewChild("pagination")
    protected pagination: PaginationDirective;

    @ContentChildren(DynamicTableTemplateDirective)
    protected templateDirectives: QueryList<DynamicTableTemplateDirective>;

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
        this.query = {};
        this.hasQuery = false;
        this.testId = "table";
        this.titlePrefix = "label";
        this.realColumns = {};
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
            this.realColumns = ObjectUtils.isArray(columns) ? columns.reduce((result, column) => {
                if (!ObjectUtils.isString(column) || column.length == 0)
                    return result;
                result[column] = {title: `${this.titlePrefix}.${column}`, sort: column};
                return result;
            }, {}) : Object.keys(columns).reduce((result, key) => {
                const value = columns[key];
                result[key] = !value || ObjectUtils.isString(value)
                    ? {title: `${this.titlePrefix}.${key}`, sort: value}
                    : value;
                return result;
            }, {} as ITableColumns);
            this.cols = Object.keys(this.realColumns);
            this.orderBy = this.orderBy in this.realColumns ? this.orderBy : this.cols[0];
            this.query = this.cols.reduce((res, c) => {
                const col = this.realColumns[c];
                res[c] = col.filterType == "checkbox" ? false : "";
                return res;
            }, {});
        }
        this.hasQuery = this.cols.some(col => this.realColumns[col].filter);
        if (changes.orderBy && this.realColumns) {
            this.orderBy = this.orderBy in this.realColumns ? this.orderBy : this.cols[0];
        }
        if (!changes.data && !changes.parallelData && !changes.itemsPerPage && !changes.orderBy && !changes.orderDescending) return;
        this.refresh();
    }

    onDragStart(ev: DragEvent, elem: HTMLElement, item: any) {
        if (!elem || !item || !ObjectUtils.isFunction(this.dragStartFn) || !this.dragStartFn({ev, elem, item})) {
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }
        ev.dataTransfer.setData("itemData", JSON.stringify(item));
        ev.dataTransfer.setData(item.type, "type");
        ev.dataTransfer.setData(item.id, "id");
    }

    onDragEnter(ev: DragEvent, elem: HTMLElement, item: any) {
        if (!elem || !item || !ObjectUtils.isFunction(this.dragEnterFn) || !this.dragEnterFn({ev, elem, item})) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none";
            return;
        }
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.dropEffect = "move";
        elem.classList.add("drop-allowed");
    }

    onDragLeave(ev: DragEvent, elem: HTMLElement) {
        if (!ev) return;
        elem.classList.remove("drop-allowed");
    }

    onDrop(ev: DragEvent, elem: HTMLElement, item: any) {
        if (!ev) return;
        ev.preventDefault();
        ev.stopPropagation();
        if (!elem || !item || !ObjectUtils.isFunction(this.dropFn)) {
            return false;
        }
        elem.classList.remove("drop-allowed");
        const source = JSON.parse(ev.dataTransfer.getData("itemData"));
        if (!this.dropFn({ev, elem, item, source})) {
            return;
        }
        elem.classList.add("dropped");
        elem.onanimationend = () => {
            elem.classList.remove("dropped");
        };
        setTimeout(elem.onanimationend, 10000);
    }

    refresh(time?: number): void {
        if (!this.pagination) return;
        this.pagination.refresh(time);
    }

    setFilter(filter: string): void {
        this.filter = filter;
        this.refresh(this.filterTime ?? 300);
    }

    setOrder(column: string): void {
        this.orderDescending = column == this.orderBy && !this.orderDescending;
        this.orderBy = column;
        this.refresh();
    }

    updateQuery(c: string, value: string | boolean): void {
        const col = this.realColumns[c];
        if (!col) return;
        if (col.filterType === "checkbox") {
            this.query[c] = !this.query[c]
        } else if (!value) {
            delete this.query[c];
        } else {
            this.query[c] = value;
        }
        this.refresh(this.filterTime ?? 300);
    }

    loadData = (page: number, itemsPerPage: number): Promise<IPaginationData> => {
        const orderBy = this.realColumns[this.orderBy]?.sort;
        return this.dataLoader(page, itemsPerPage, orderBy, this.orderDescending, this.filter, this.query);
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
