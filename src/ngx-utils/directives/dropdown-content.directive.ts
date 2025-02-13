import {Directive, Input, OnDestroy, OnInit, Optional, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {autoPlacement, autoUpdate, computePosition, Middleware} from "@floating-ui/dom";
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

    protected root: HTMLElement;
    protected subscription: Subscription;
    protected lastPlacement: string;
    protected cleanUp: () => void;

    constructor(protected vcr: ViewContainerRef,
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
        if (!this.root) {
            const rootNode = this.vcr.element.nativeElement.getRootNode();
            if (rootNode === document) {
                this.root = document.body;
            } else {
                this.root = rootNode;
            }
        }
        const ref = this.dropdown.nativeElement;
        const content = this.createWrapper();
        this.dropdown.contentElement = content;
        // Set up floating UI positioning settings
        const placement = this.dropdown.placement || "bottom";
        const middleware: Middleware[] = [];
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
                        strategy: "fixed",
                        placement,
                        middleware
                    }
                ).then(({x, y, placement}) => {
                    Object.assign(content.style, {
                        opacity: init ? "0" : "1",
                        position: "fixed",
                        left: `${x}px`,
                        top: `${y}px`,
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
            });
        } else {
            this.vcr.element.nativeElement?.appendChild(wrapper);
        }
        if (this.lastPlacement) {
            wrapper.classList.add(this.lastPlacement);
        }
        return wrapper;
    }

    initialize(): void {
        this.createView(true);
        setTimeout(() => this.destroyView());
    }
}
