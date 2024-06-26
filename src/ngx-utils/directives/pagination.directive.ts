import {Directive, EventEmitter, Input, NgZone, OnChanges, Output, SimpleChanges} from "@angular/core";
import {IPaginationData, ITimer, PaginationDataLoader, PaginationItemContext} from "../common-types";
import {TimerUtils} from "../utils/timer.utils";

@Directive({
    selector: "[pagination]",
    exportAs: "pagination"
})
export class PaginationDirective implements OnChanges {

    get total(): number {
        return this.data ? this.data.total : 0;
    }

    get items(): any[] {
        return this.data ? this.data.items : [];
    }

    @Input("pagination") loader: PaginationDataLoader;
    @Input() page: number;
    @Input() itemsPerPage: number;
    @Input() updateTime: number;
    @Input() waitFor: Promise<any>;

    @Output() pageChange: EventEmitter<number>;
    @Output() onRefresh: EventEmitter<PaginationDirective>;

    maxPage: number;

    private data: IPaginationData;
    private updateTimer: ITimer;

    constructor(private zone: NgZone) {
        this.pageChange = new EventEmitter<number>();
        this.onRefresh = new EventEmitter<PaginationDirective>();
        this.updateTimer = TimerUtils.createTimeout(() => this.loadData(), this.updateTime);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.loader && !changes.itemsPerPage && !changes.page) return;
        this.page = isNaN(this.page) || this.page < 1 ? 1 : this.page;
        this.itemsPerPage = isNaN(this.itemsPerPage) || this.itemsPerPage < 1 ? 20 : this.itemsPerPage;
        this.waitFor = this.waitFor || Promise.resolve(true);
        this.refresh();
    }

    refresh(time?: number): void {
        time = isNaN(time) || time < 0 ? this.updateTime : time;
        this.updateTimer.time = isNaN(time) || time < 0 ? 100 : time;
        this.waitFor.then(() => {
            this.updateTimer.run();
        });
    }

    paginate(page: number): void {
        this.page = page;
        this.pageChange.emit(page);
        this.refresh();
    }

    private loadData(): void {
        if (!this.loader) return;
        this.loader(this.page, this.itemsPerPage).then(data => {
            this.maxPage = !data || data.total <= 0 ? 1 : Math.floor((data.total - 1) / this.itemsPerPage) + 1;
            this.data = data;
            const baseIndex = (this.page - 1) * this.itemsPerPage;
            const items = (data.items || []);
            data.items = items.map((item, index) => {
                const ix = baseIndex + index;
                return item instanceof PaginationItemContext
                    ? item
                    : new PaginationItemContext(item, items, items.length, index, ix);
            });
            if (this.page > this.maxPage) {
                this.paginate(this.maxPage);
                return;
            }
            this.zone.run(() => this.onRefresh.emit(this));
        });
    }
}
