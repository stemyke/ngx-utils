import {Directive, ViewContainerRef, TemplateRef, OnInit, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {PaginationDirective} from "./pagination.directive";

export class PaginationItemContext {

    constructor(public item: any, public count: number, public index: number, public dataIndex: number) {
    }

    get first(): boolean {
        return this.index === 0;
    }

    get last(): boolean {
        return this.index === this.count - 1;
    }

    get even(): boolean {
        return this.index % 2 === 0;
    }

    get odd(): boolean {
        return !this.even;
    }
}

@Directive({
    selector: "[paginationItem]"
})
export class PaginationItemDirective implements OnInit, OnDestroy {

    private onRefresh: Subscription;

    constructor(private pagination: PaginationDirective, private viewContainer: ViewContainerRef, private templateRef: TemplateRef<any>) {

    }

    ngOnInit(): void {
        this.onRefresh = this.pagination.onRefresh.subscribe(() => this.renderView());
    }

    ngOnDestroy(): void {
        this.onRefresh.unsubscribe();
    }

    private renderView(): void {
        const items = this.pagination.items;
        const baseIndex = (this.pagination.page - 1) * this.pagination.itemsPerPage;
        this.viewContainer.clear();
        items.forEach((item, index) => {
            const ix = baseIndex + index;
            item = item instanceof PaginationItemContext ? item : new PaginationItemContext(item, items.length, ix, ix);
            this.viewContainer.createEmbeddedView(this.templateRef, item);
        });
    }
}
