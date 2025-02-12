import {Directive, ElementRef, OnDestroy, OnInit, Optional, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {DropdownDirective} from "./dropdown.directive";
import {ObservableUtils} from "../utils/observable.utils";
import {autoUpdate, computePosition} from "@floating-ui/dom";

@Directive({
    standalone: false,
    selector: "[dropdownContent]",
    exportAs: "dropdown-content",
})
export class DropdownContentDirective implements OnInit, OnDestroy {

    protected root: HTMLElement;
    protected subscription: Subscription;
    protected observer: ResizeObserver;
    protected cleanUp: () => void;

    constructor(readonly dropdown: DropdownDirective,
                readonly vcr: ViewContainerRef,
                @Optional() readonly templateRef: TemplateRef<any>) {
        if (!this.templateRef) {
            throw new Error("TemplateRef is required! Please use with *dropdownContent");
        }
    }

    ngOnInit() {
        this.subscription = ObservableUtils.multiSubscription(
            this.dropdown.onShown.subscribe(() => this.createView()),
            this.dropdown.onHidden.subscribe(() => this.destroyView())
        );
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        // this.observer = new ResizeObserver(entries => {
        //     let width = 0;
        //     let height = 0;
        //     entries.forEach(entry => {
        //         if (!entry.contentRect) return;
        //         width = Math.max(width, entry.contentRect.width);
        //         height = Math.max(height, entry.contentRect.height);
        //     });
        //     this.dropdown.setProperty("list-width", `${width}px`);
        //     this.dropdown.setProperty("list-height", `${height}px`);
        // });
        // this.observer.observe(this.element.nativeElement);
    }

    ngOnDestroy() {
        // this.observer?.unobserve(this.element.nativeElement);
        this.subscription?.unsubscribe();
        this.destroyView();
    }

    protected createView() {
        if (!this.root) {
            const rootNode = this.vcr.element.nativeElement.getRootNode();
            if (rootNode === document) {
                this.root = document.body;
            } else {
                this.root = rootNode;
            }
        }
        const referenceEl = this.dropdown.nativeElement;
        const floatingEl = document.createElement("div");
        const ref = this.vcr.createEmbeddedView(this.templateRef);
        ref.rootNodes.forEach(node => floatingEl.appendChild(node));
        this.root.appendChild(floatingEl);
        this.dropdown.floatingElement = floatingEl;
        const updatePosition = () => {
            computePosition(
                referenceEl,
                floatingEl,
                {strategy: "fixed"}
            ).then(({x, y}) => {
                Object.assign(floatingEl.style, {
                    position: "fixed",
                    background: "red",
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        };
        this.cleanUp = autoUpdate(
            referenceEl,
            floatingEl,
            updatePosition,
        );
    }

    protected destroyView() {
        this.vcr.clear();
        this.dropdown.floatingElement?.remove();
        this.cleanUp?.();
    }
}
