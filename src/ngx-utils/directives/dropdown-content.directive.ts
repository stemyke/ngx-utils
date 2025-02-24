import {Directive, ElementRef, Inject, OnDestroy, OnInit, Optional, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {autoPlacement, autoUpdate, arrow, computePosition, Middleware, Strategy} from "@floating-ui/dom";

import {ROOT_ELEMENT} from "../common-types";
import {DropdownDirective} from "./dropdown.directive";
import {ObservableUtils} from "../utils/observable.utils";
import {getCssVariables} from "../utils/misc";

const rectProps = ["x", "y", "width", "height"];

@Directive({
    standalone: false,
    selector: "[dropdownContent]",
    exportAs: "dropdown-content",
})
export class DropdownContentDirective implements OnInit, OnDestroy {

    protected subscription: Subscription;
    protected attachTo: HTMLElement;
    protected attachOutside: boolean;
    protected lastPlacement: string;
    protected cleanUp: () => void;

    constructor(protected vcr: ViewContainerRef,
                @Optional() @Inject(ROOT_ELEMENT) protected rootElem: HTMLElement,
                @Optional() protected dropdown: DropdownDirective,
                @Optional() readonly templateRef: TemplateRef<any>) {
        if (!this.dropdown) {
            throw new Error("DropdownDirective is required! Please use it inside a dd, drop-down directive attribute");
        }
        if (!this.templateRef) {
            throw new Error("TemplateRef is required! Please use with *dropdownContent");
        }
        this.lastPlacement = null;
    }

    ngOnInit() {
        this.subscription = ObservableUtils.multiSubscription(
            this.dropdown.onShown.subscribe(() => this.createView()),
            this.dropdown.onHidden.subscribe(() => this.destroyView())
        );
    }

    ngOnDestroy() {
        // this.observer?.unobserve(this.element.nativeElement);
        this.subscription?.unsubscribe();
        this.destroyView();
    }

    protected createView(init: boolean = false) {
        const mobileWidth = this.dropdown.mobileViewUnder || 0;
        const ref = this.dropdown.nativeElement;
        const [content, arrowEl] = this.createWrapper();
        this.dropdown.contentElement = content;
        // Set up floating UI positioning settings
        const placement = this.dropdown.placement || "bottom";
        const strategy: Strategy = this.attachOutside ? "fixed" : "absolute";
        const middleware = [
            arrow({element: arrowEl})
        ];
        if (this.dropdown.autoPlacement) {
            middleware.push(autoPlacement(this.dropdown.autoPlacement));
        }
        // Set up floating UI auto update
        this.cleanUp = autoUpdate(
            ref,
            content,
            () => {
                computePosition(
                    ref,
                    content,
                    {
                        strategy,
                        placement,
                        middleware
                    }
                ).then(({x, y, placement, middlewareData}) => {

                    if (middlewareData.arrow) {
                        const {x, y} = middlewareData.arrow;
                        Object.assign(arrowEl.style, {
                            left: x != null ? `${x}px` : ``,
                            top: y != null ? `${y}px` : ``,
                        });
                    }

                    const isMobileView = window.innerWidth <= mobileWidth;
                    Object.assign(content.style, {
                        opacity: init ? "0" : "1",
                        position: isMobileView ? "fixed" : strategy,
                        left: isMobileView ? `0px`: `${x}px`,
                        right: isMobileView ? `0px`: undefined,
                        top: isMobileView ? `0px`: `${y}px`,
                        bottom: isMobileView ? `0px`: undefined,
                        zIndex: `var(--dd-z-index, 100)`
                    });
                    const refRect = ref.getBoundingClientRect();
                    const contentRect = content.getBoundingClientRect();
                    const lastPlacement = this.lastPlacement;
                    const newPlacement = `dropdown-placement-${placement}`;
                    if (lastPlacement) {
                        ref.classList.replace(lastPlacement, newPlacement);
                        content.classList.replace(lastPlacement, newPlacement);
                    } else {
                        ref.classList.add(newPlacement);
                        content.classList.add(newPlacement);
                    }
                    if (isMobileView) {
                        content.classList.add(`dropdown-content-mobile`);
                    } else {
                        content.classList.remove(`dropdown-content-mobile`);
                    }
                    rectProps.forEach(prop => {
                        content.style.setProperty(`--toggle-${prop}`, `${refRect[prop]}px`);
                        ref.style.setProperty(`--content-${prop}`, `${contentRect[prop]}px`);
                    });
                    this.lastPlacement = newPlacement;
                });
            },
        );
    }

    protected destroyView() {
        this.vcr.clear();
        this.dropdown.contentElement?.remove();
        this.cleanUp?.();
    }

    protected whereToAttach(): HTMLElement {
        const target = this.dropdown.attachTo;
        if (target === "root" && this.rootElem) {
            return this.rootElem;
        }
        if (target instanceof ElementRef) {
            return target.nativeElement;
        }
        if (target instanceof HTMLElement) {
            return target;
        }
        const anchor = this.vcr.element.nativeElement as HTMLElement;
        return anchor?.parentElement || this.rootElem;
    }

    protected createWrapper() {
        const wrapper = document.createElement("div");
        const arrow = document.createElement("div");
        arrow.classList.add(`dropdown-content-arrow`);
        const ref = this.vcr.createEmbeddedView(this.templateRef);
        ref.rootNodes.forEach(node => wrapper.appendChild(node));

        this.attachTo = this.whereToAttach();
        this.attachTo.appendChild(wrapper);
        this.attachOutside = !this.dropdown.nativeElement?.contains(this.attachTo);

        if (this.attachOutside) {
            const referenceStyles = getCssVariables(this.dropdown.nativeElement);
            const wrapperStyles = getCssVariables(wrapper);
            Object.keys(referenceStyles).forEach(key => {
                if (!wrapperStyles[key]) {
                    wrapper.style.setProperty(key, referenceStyles[key]);
                }
            });
        }

        const autoPlacement = this.dropdown.autoPlacement;
        if (this.lastPlacement) {
            wrapper.classList.add(this.lastPlacement);
        }
        if (autoPlacement) {
            const vertical = autoPlacement.allowedPlacements.some(p => p.includes("top") || p.includes("bottom"));
            const horizontal = autoPlacement.allowedPlacements.some(p => p.includes("left") || p.includes("right"));
            if (vertical && horizontal) {
                wrapper.classList.add(`dropdown-content-axis-both`);
            } else {
                const axis = vertical ? "vertical" : "horizontal";
                wrapper.classList.add(`dropdown-content-axis-${axis}`);
            }
        }
        wrapper.classList.add("dropdown-content-wrap");
        wrapper.appendChild(arrow);
        return [wrapper, arrow];
    }

    initialize(): void {
        this.createView(true);
        setTimeout(() => this.destroyView());
    }
}
