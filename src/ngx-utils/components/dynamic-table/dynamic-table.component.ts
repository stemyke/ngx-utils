import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren, ElementRef,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild, ViewEncapsulation
} from "@angular/core";

import {
    DragEventHandler,
    IPaginationData,
    ITableColumns,
    ITableDataQuery,
    ITableTemplates,
    PaginationItemContext,
    TableColumns,
    TableDataLoader
} from "../../common-types";
import {ObjectUtils} from "../../utils/object.utils";
import {UniqueUtils} from "../../utils/unique.utils";
import {checkTransitions} from "../../utils/misc";

import {DynamicTableTemplateDirective} from "../../directives/dynamic-table-template.directive";
import {PaginationDirective} from "../../directives/pagination.directive";
import {DropdownDirective} from "../../directives/dropdown.directive";
import {MathUtils} from "../../utils/math.utils";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "dynamic-table",
    styleUrls: ["./dynamic-table.component.scss"],
    templateUrl: "./dynamic-table.component.html",
})
export class DynamicTableComponent implements AfterContentInit, AfterViewInit, OnChanges {

    @Input() dataLoader: TableDataLoader;
    @Input() data: any[];
    @Input() selected: any;
    @Input() page: number;
    @Input() urlParam: string;
    @Input() parallelData: any[];
    @Input() columns: TableColumns;

    /**
     * Parameter for displaying a simple filter search box
     */
    @Input() showFilter: boolean;

    /**
     * Parameter for specifying a label for filter
     */
    @Input() filterLabel: string;

    /**
     * Parameter for specifying a placeholder for filter
     */
    @Input() placeholder: string;

    /**
     * Parameter for displaying an item per page selector dropdown with the specified numbers
     */
    @Input() showItems: number[];

    /**
     * Parameter for setting how many items should be displayed by default
     */
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

    @Input() dragStartFn: DragEventHandler;
    @Input() dragEnterFn: DragEventHandler;
    @Input() dropFn: DragEventHandler<void>;

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

    @ViewChild("columnsTemplate", {static: true})
    columnsTemplate: TemplateRef<any>;

    @ViewChild("defaultRowTemplate", {static: true})
    defaultRowTemplate: TemplateRef<any>;

    @ViewChild("defaultWrapperTemplate", {static: true})
    defaultWrapperTemplate: TemplateRef<any>;

    @ViewChild("pagination")
    protected pagination: PaginationDirective;

    @ContentChildren(DynamicTableTemplateDirective)
    protected templateDirectives: QueryList<DynamicTableTemplateDirective>;

    protected static compare(orderBy: string, a: PaginationItemContext, b: PaginationItemContext): number {
        a = a.item ? a.item[orderBy] : null;
        b = b.item ? b.item[orderBy] : null;
        return ObjectUtils.compare(a, b);
    }

    constructor(protected element: ElementRef<HTMLElement>) {
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

    setProperty(name: string, value: any): void {
        const elem = this.element.nativeElement;
        if (!elem) return;
        elem.style.setProperty(`--${name}`, value);
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
            const sortable = this.cols.filter(c => this.realColumns[c].sort);
            const query = this.query || {};
            this.orderBy = sortable.includes(this.orderBy) ? this.orderBy : sortable[0] || null;
            this.query = this.cols.reduce((res, col) => {
                const value = query[col];
                if (!value) return res;
                res[col] = value;
                return res;
            }, {});
            this.setProperty("cell-width", MathUtils.round(100 / this.cols.length, 4) + "%");
        }
        this.hasQuery = this.cols.some(col => this.realColumns[col].filter);
        if (changes.orderBy && this.realColumns && this.cols) {
            const sortable = this.cols.filter(c => this.realColumns[c].sort);
            this.orderBy = this.orderBy in sortable ? this.orderBy : sortable[0] || null;
        }
        if (!changes.data && !changes.parallelData && !changes.dataLoader && !changes.itemsPerPage && !changes.orderBy && !changes.orderDescending) return;
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
        ev.preventDefault();
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
        ev.dataTransfer.effectAllowed = "none";
        ev.dataTransfer.dropEffect = "none";
        elem.classList.remove("drop-allowed");
    }

    onDrop(ev: DragEvent, elem: HTMLElement, item: any) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!elem || !item || !ObjectUtils.isFunction(this.dropFn)) {
            return;
        }
        const source = JSON.parse(ev.dataTransfer.getData("itemData"));
        elem.classList.remove("drop-allowed");
        checkTransitions(elem, () => {
            checkTransitions(elem, () => {
                this.dropFn({ev, elem, item, source});
            });
            elem.classList.remove("dropped");
        });
        elem.classList.add("dropped");
    }

    refresh(time?: number): void {
        if (!this.pagination) return;
        this.pagination.refresh(time);
    }

    setFilter(filter: string) {
        this.filter = filter;
        this.refresh(this.filterTime ?? 300);
    }

    setSorting(column: string, toggle?: DropdownDirective) {
        if (toggle) {
            return;
        }
        this.orderDescending = column == this.orderBy && !this.orderDescending;
        this.orderBy = column;
        this.refresh();
    }

    setQueryValue(c: string, value: string | boolean) {
        const col = this.realColumns[c];
        if (!col?.filter) return;
        switch (col.filterType) {
            case "enum":
                const set = new Set((this.query[c] || []) as string[]);
                const val = `${value}`;
                if (set.has(val)) {
                    set.delete(val);
                    if (set.size === 0) {
                        delete this.query[c];
                        break;
                    }
                } else {
                    set.add(val);
                }
                this.query[c] = Array.from(set);
                break;
            case "checkbox":
                if (this.query[c]) {
                    delete this.query[c];
                    break;
                }
                this.query[c] = true;
                break;
            default:
                if (!value) {
                    delete this.query[c];
                    break;
                }
                this.query[c] = value;
                break;
        }
        this.refresh(this.filterTime ?? 300);
    }

    setItemsPerPage(count: number) {
        this.itemsPerPage = count;
        this.refresh();
    }

    loadData = (page: number, itemsPerPage: number): Promise<IPaginationData> => {
        const orderBy = this.realColumns[this.orderBy]?.sort;
        return this.dataLoader(page, itemsPerPage, orderBy, this.orderDescending, this.filter, this.query);
    };

    protected loadLocalData(page: number, rowsPerPage: number, orderBy: string, orderDescending: boolean, filter: string): Promise<IPaginationData> {
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
