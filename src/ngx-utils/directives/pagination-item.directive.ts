import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {PaginationDirective} from "./pagination.directive";

@Directive({
    standalone: false,
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
        this.viewContainer.clear();
        this.pagination.items.forEach((item: any, ix: number) => {
            item.$implicit = item;
            item.rowIndex = ix;
            this.viewContainer.createEmbeddedView(this.templateRef, item);
        });
    }
}
