import {Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output} from "@angular/core";
import {AutoPlacementOptions, Boundary, Placement} from "@floating-ui/dom";
import {DropdownAttachTo} from "../common-types";

@Directive({
    standalone: false,
    selector: "[dd],[drop-down]",
    exportAs: "dropdown"
})
export class DropdownDirective implements OnDestroy {

    protected static active: DropdownDirective = null;

    protected opened: boolean;
    protected disabled: boolean;

    /**
     * Determines if the dropdown should be closed even if we click inside it
     */
    @Input() closeInside: boolean;

    /**
     * Determines where the floating element needs to be placed
     */
    @Input() attachTo: DropdownAttachTo;

    /**
     * Determines the boundary element of the floating element when shifting
     */
    @Input() boundary: Boundary;

    /**
     * Where to place the floating element relative to the reference element.
     */
    @Input() placement: Placement;

    /**
     * Optimizes the visibility of the floating element by choosing the placement
     * that has the most space available automatically, without needing to specify a
     * preferred placement. Alternative to `flip`.
     * @see https://floating-ui.com/docs/autoPlacement
     */
    @Input() autoPlacement: AutoPlacementOptions;

    /**
     * Determines if the dropdown content should be displayed in a fixed full screen view under this window width
     * @default 0
     */
    @Input() mobileViewUnder: number;

    /**
     * Determines if the dropdown content should always be displayed in a fixed full screen view
     * @default false
     */
    @Input() fixed: boolean;

    /**
     * Determines if the dropdown should react to keys to close like 'Esc'
     * @default true
     */
    @Input() keyboardHandler: boolean;

    @Output() onShown: EventEmitter<DropdownDirective>;
    @Output() onHidden: EventEmitter<DropdownDirective>;
    @Output() onKeyboard: EventEmitter<KeyboardEvent>;

    contentElement: HTMLElement;

    private readonly onClick: (event: Event) => void;
    private readonly onKeyDown: (event: KeyboardEvent) => boolean;

    get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }

    @HostBinding("class.open")
    get isOpened(): boolean {
        return this.opened;
    }

    @HostBinding("class.disabled")
    get getDisabled(): boolean {
        return this.disabled;
    }

    @Input()
    set isDisabled(value: boolean) {
        this.disabled = value;
        if (!value) return;
        this.hide();
    }

    constructor(protected element: ElementRef<HTMLElement>) {
        this.opened = false;
        this.disabled = false;
        this.closeInside = true;
        this.attachTo = null;
        this.boundary = "clippingAncestors";
        this.mobileViewUnder = 0;
        this.fixed = false;
        this.keyboardHandler = true;
        this.onShown = new EventEmitter<any>();
        this.onHidden = new EventEmitter<any>();
        this.onKeyboard = new EventEmitter<KeyboardEvent>();
        this.onClick = (event: MouseEvent): void => {
            // We don't care about clicks with right/center mouse buttons
            if (event.button) return;
            const target = (event.composedPath()?.shift() || event.target) as Node;
            // If blocked closing inside we only consider inside if the target is not directly the contentElement
            // We only have a contentElement in case when we are using *dropdownContent directive
            if (!this.closeInside && (!this.contentElement || target !== this.contentElement)) {
                // Try to determine if we are inside by collecting the possible parent elements to check
                const parents = !this.contentElement ? [] : Array.from(this.contentElement.childNodes);
                if (this.nativeElement) {
                    parents.push(this.nativeElement);
                }
                // If one of the parents contains the target then we clicked inside
                if (parents.some(child => child.contains(target))) return;
            }
            setTimeout(() => this.hide(), event.type == "touchend" ? 250 : 100);
        };
        this.onKeyDown = (event: KeyboardEvent): boolean => {
            const input = (event.composedPath()?.shift() || event.target) as HTMLInputElement;
            const notInput = !input || (input.tagName !== "INPUT" && input.tagName !== "TEXTAREA");
            if ("Tab" === event.key || notInput) {
                event.stopPropagation();
                event.preventDefault();
            }
            if ("Esc" === event.key || "Escape" === event.key) {
                this.hide();
                return false;
            }
            this.onKeyboard.emit(event);
            return true;
        };
    }

    ngOnDestroy(): void {
        if (DropdownDirective.active === this) {
            DropdownDirective.active = null;
            this.onHidden.emit(this);
        }
    }

    showEvent(): void {
        this.onShown.emit(this);
    }

    hideEvent(): void {
        this.onHidden.emit(this);
    }

    @HostListener("keydown.enter", ["$event"])
    @HostListener("keydown.space", ["$event"])
    show($event?: Event) {
        if (this.opened) return;
        if ($event) {
            if (!this.keyboardHandler) return true;
            $event.preventDefault();
        }
        if (this.disabled) return true;
        this.opened = true;
        this.showEvent();
        DropdownDirective.active = this;
        // Prevent toggle from selecting an item right after it is shown
        setTimeout(() => {
            if (!this.opened) return;
            document.addEventListener("click", this.onClick);
            document.addEventListener("keydown", this.onKeyDown);
        }, 10);
        return true;
    }

    hide() {
        if (!this.opened) return true;
        this.opened = false;
        this.hideEvent();
        document.removeEventListener("click", this.onClick);
        document.removeEventListener("keydown", this.onKeyDown);
        // Prevent toggle from refocus itself after it is hidden because of another toggle
        setTimeout(() => {
            if (DropdownDirective.active === this) {
                DropdownDirective.active = null;
                this.nativeElement?.focus();
            }
        }, 10);
        return true;
    }
}
