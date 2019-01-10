import {Directive, ViewContainerRef, TemplateRef, OnInit, OnDestroy, Input} from "@angular/core";
import {Subscription} from "rxjs";
import {PaginationItemContext} from "../common-types";
import {PaginationDirective} from "./pagination.directive";

@Directive({
    selector: "[paginationItem]"
})
export class PaginationItemDirective implements OnInit, OnDestroy {

    @Input() set paginationItemExtraContext(context: any) {
        this.context = context;
    }

    private context: any;
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
            item = item instanceof PaginationItemContext ? item : new PaginationItemContext(item, item, items.length, ix, ix);
            Object.assign(item, this.context);
            this.viewContainer.createEmbeddedView(this.templateRef, item);
        });
    }
}
