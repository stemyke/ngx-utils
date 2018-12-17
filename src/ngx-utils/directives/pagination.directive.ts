import {Directive, EventEmitter, Input, NgZone, OnChanges, Output, SimpleChanges} from "@angular/core";
import {IPaginationData, ITimer, PaginationDataLoader} from "../common-types";
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
    @Output() onRefresh: EventEmitter<PaginationDirective>;

    private data: IPaginationData;
    private updateTimer: ITimer;

    constructor(private zone: NgZone) {
        this.onRefresh = new EventEmitter<PaginationDirective>();
        this.updateTimer = TimerUtils.createTimeout(() => this.loadData(), this.updateTime);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.loader && !changes.itemsPerPage) return;
        this.page = isNaN(this.page) || this.page < 1 ? 1 : this.page;
        this.itemsPerPage = isNaN(this.itemsPerPage) || this.itemsPerPage < 1 ? 20 : this.itemsPerPage;
        this.updateTimer.time = isNaN(this.updateTime) || this.updateTime < 0 ? 100 : this.updateTime;
        this.waitFor = this.waitFor || Promise.resolve(true);
        this.waitFor.then(() => this.refresh());
    }

    refresh(): void {
        this.updateTimer.run();
    }

    paginate(page: number): void {
        this.page = page;
        this.refresh();
    }

    private loadData(): void {
        if (!this.loader) return;
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
