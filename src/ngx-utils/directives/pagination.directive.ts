import {Directive, Input, OnChanges, SimpleChanges, NgZone, EventEmitter, Output} from "@angular/core";
import {ITimer, TimerUtils} from "../utils";

export interface IPaginationData {
    total: number;
    items: any[];
}

export type DataLoader = (page: number, itemsPerPage: number) => Promise<IPaginationData>;

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

    @Input("pagination") loader: DataLoader;
    @Input() page: number;
    @Input() itemsPerPage: number;
    @Input() updateTime: number;
    @Input() waitFor: Promise<any>;
    @Output() onRefresh: EventEmitter<PaginationDirective>;

    private data: IPaginationData;
    private updateTimer: ITimer;

    constructor(private zone: NgZone) {
        this.onRefresh = new EventEmitter<PaginationDirective>();
        this.updateTimer = TimerUtils.createTimeout();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.loader && !changes.itemsPerPage) return;
        this.page = isNaN(this.page) || this.page < 1 ? 1 : this.page;
        this.itemsPerPage = isNaN(this.itemsPerPage) || this.itemsPerPage < 1 ? 20 : this.itemsPerPage;
        this.updateTime = isNaN(this.updateTime) || this.updateTime < 0 ? 100 : this.updateTime;
        this.waitFor = this.waitFor || Promise.resolve(true);
        this.waitFor.then(() => this.refresh());
    }

    refresh(): void {
        if (!this.loader) return;
        this.updateTimer.clear();
        this.updateTimer.set(() => this.loadData(), this.updateTime);
    }

    paginate(page: number): void {
        this.page = page;
        this.refresh();
    }

    private loadData(): void {
        this.loader(this.page, this.itemsPerPage).then(data => {
            const maxPage = !data || data.total <= 0 ? 1 : Math.floor((data.total - 1) / this.itemsPerPage) + 1;
            this.data = data;
            if (this.page > maxPage) {
                this.paginate(maxPage);
                return;
            }
            this.zone.run(() => this.onRefresh.emit(this));
        });
    }
}