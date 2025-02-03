import {Directive, ElementRef, OnDestroy, OnInit} from "@angular/core";
import {DropdownDirective} from "./dropdown.directive";

@Directive({
    standalone: false,
    selector: "[dropdownContent]",
    exportAs: "dropdown-content",
})
export class DropdownContentDirective implements OnInit, OnDestroy {

    protected observer: ResizeObserver;

    constructor(readonly element: ElementRef<HTMLElement>,
                readonly dropdown: DropdownDirective) {
    }

    ngOnInit() {
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        this.observer = new ResizeObserver(entries => {
            let width = 0;
            let height = 0;
            entries.forEach(entry => {
                if (!entry.contentRect) return;
                width = Math.max(width, entry.contentRect.width);
                height = Math.max(height, entry.contentRect.height);
            });
            this.dropdown.setProperty("list-width", `${width}px`);
            this.dropdown.setProperty("list-height", `${height}px`);
        });
        this.observer.observe(this.element.nativeElement);
    }

    ngOnDestroy() {
        this.observer?.unobserve(this.element.nativeElement);
    }
}
