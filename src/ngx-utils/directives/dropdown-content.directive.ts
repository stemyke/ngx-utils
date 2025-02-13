import {Directive, Input, OnDestroy, OnInit, Optional, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {DropdownDirective} from "./dropdown.directive";
import {ObservableUtils} from "../utils/observable.utils";
import {autoUpdate, computePosition} from "@floating-ui/dom";
import {getCssVariables} from "../utils/misc";

interface DropdownContentConfig {
    attachToRoot?: boolean;
}

@Directive({
    standalone: false,
    selector: "[dropdownContent]",
    exportAs: "dropdown-content",
})
export class DropdownContentDirective implements OnInit, OnDestroy {

    @Input() dropdownContentAttachToRoot: boolean;

    protected root: HTMLElement;
    protected subscription: Subscription;
    protected observer: ResizeObserver;
    protected cleanUp: () => void;

    constructor(readonly vcr: ViewContainerRef,
                @Optional() readonly dropdown: DropdownDirective,
                @Optional() readonly templateRef: TemplateRef<any>) {
        if (!this.dropdown) {
            throw new Error("DropdownDirective is required! Please use it inside a dd, drop-down directive attribute");
        }
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
        const reference = this.dropdown.nativeElement;
        const content = this.createWrapper();
        this.dropdown.contentElement = content;
        const updatePosition = () => {
            computePosition(
                reference,
                content,
                {strategy: "fixed"}
            ).then(({x, y}) => {
                Object.assign(content.style, {
                    position: "fixed",
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        };
        this.cleanUp = autoUpdate(
            reference,
            content,
            updatePosition,
        );
    }

    protected destroyView() {
        this.vcr.clear();
        this.dropdown.contentElement?.remove();
        this.cleanUp?.();
    }

    protected createWrapper() {
        const wrapper = document.createElement("div");
        const ref = this.vcr.createEmbeddedView(this.templateRef);
        ref.rootNodes.forEach(node => wrapper.appendChild(node));

        if (this.dropdown.attachToRoot) {
            this.root.appendChild(wrapper);
            const referenceStyles = getCssVariables(this.dropdown.nativeElement);
            const wrapperStyles = getCssVariables(wrapper);
            Object.keys(referenceStyles).forEach(key => {
                if (!wrapperStyles[key]) {
                    wrapper.style.setProperty(key, referenceStyles[key]);
                }
            })
            return wrapper;
        }

        this.vcr.element.nativeElement?.appendChild(wrapper);
        return wrapper;
    }
}
