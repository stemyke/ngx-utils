import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {Subscription} from "rxjs";
import {ObjectUtils} from "../../utils/object.utils";
import {StateService} from "../../services/state.service";
import {PaginationDirective} from "../../directives/pagination.directive";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "pagination-menu",
    templateUrl: "./pagination-menu.component.html",
    styleUrls: ["./pagination-menu.component.scss"],
})
export class PaginationMenuComponent implements OnInit, OnDestroy, OnChanges {

    @Input() maxSize: number;
    @Input() urlParam: string;
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
        this.maxSize = 5;
        this.directionLinks = true;
        this.boundaryLinks = true;
    }

    ngOnInit(): void {
        this.onRefresh = this.pagination.onRefresh.subscribe(() => this.setPages());
    }

    ngOnDestroy(): void {
        if (!this.onRefresh) return;
        this.onRefresh.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.maxSize = isNaN(this.maxSize) || this.maxSize <= 0 ? 5 : this.maxSize;
        this.directionLinks = ObjectUtils.isBoolean(this.directionLinks) ? this.directionLinks : true;
        this.boundaryLinks = ObjectUtils.isBoolean(this.boundaryLinks) ? this.boundaryLinks : true;
        this.setPages();
    }

    paginate(page: number): void {
        if (this.pagination.page == page || this.pagination.maxPage < page || page < 1) return;
        if (!this.urlParam) {
            this.pagination.paginate(page);
            return;
        }
        const params = Object.assign({}, this.state.params);
        params[this.urlParam] = page.toString();
        const path = StateService.toPath(this.state.route, params);
        this.state.navigateByUrl(path);
    }

    protected setPages(): number {
        if (!this.pagination) return;
        const totalPages = this.pagination.maxPage;
        let startPage = Math.max(this.pagination.page - Math.floor(this.maxSize / 2), 1);
        let endPage = startPage + this.maxSize - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(endPage - this.maxSize + 1, 1);
        }
        const pages: number[] = [];
        for (let num = startPage; num <= endPage; num++) {
            pages.push(num);
        }
        this.pages = pages;
    }
}
