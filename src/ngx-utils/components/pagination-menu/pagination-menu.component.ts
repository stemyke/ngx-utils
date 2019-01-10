import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {Subscription} from "rxjs";
import {ObjectUtils} from "../../utils/object.utils";
import {StateService} from "../../services/state.service";
import {PaginationDirective} from "../../directives/pagination.directive";

@Component({
    moduleId: module.id,
    selector: "pagination-menu",
    templateUrl: "./pagination-menu.component.html"
})
export class PaginationMenuComponent implements OnInit, OnDestroy, OnChanges {

    @Input() maxSize: number;
    @Input() urlPage: number;
    @Input() directionLinks: boolean;
    @Input() boundaryLinks: boolean;

    pages: number[];

    get hasPrev(): boolean {
        return this.pagination.page > 1;
    }

    get hasNext(): boolean {
        return this.pagination.page < this.pagination.maxPage
    }

    private onRefresh: Subscription;

    constructor(public state: StateService, public pagination: PaginationDirective) {

    }

    ngOnInit(): void {
        this.onRefresh = this.pagination.onRefresh.subscribe(() => this.setPages());
    }

    ngOnDestroy(): void {
        this.onRefresh.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.maxSize = isNaN(this.maxSize) || this.maxSize <= 0 ? 5 : this.maxSize;
        this.urlPage = ObjectUtils.isNumber(this.urlPage) && this.urlPage > 0 ? this.urlPage : 0;
        this.directionLinks = ObjectUtils.isBoolean(this.directionLinks) ? this.directionLinks : true;
        this.boundaryLinks = ObjectUtils.isBoolean(this.boundaryLinks) ? this.boundaryLinks : true;
        this.setPages();
    }

    paginate(page: number): void {
        if (this.pagination.page == page) return;
        if (this.urlPage > 0) {
            this.state.navigate(this.state.urlSegments.map((segment, index) => {
                return index == this.urlPage ? page : segment.path;
            }));
            return;
        }
        this.pagination.paginate(page);
    }

    protected setPages(): number {
        if (!this.pagination) return;
        const totalPages = this.pagination.maxPage;
        let startPage = Math.max(this.pagination.page - Math.floor(this.maxSize / 2), 1);
        let endPage = startPage + this.maxSize - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = endPage - this.maxSize + 1;
        }
        const pages: number[] = [];
        for (let num = startPage; num <= endPage; num++) {
            pages.push(num);
        }
        this.pages = pages;
    }
}
