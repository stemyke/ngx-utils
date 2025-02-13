import {Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output} from "@angular/core";
import {AutoPlacementOptions, Placement} from "@floating-ui/dom";

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
     * Determines if the floating element needs to be placed in the root node or keep where it was before
     */
    @Input() attachToRoot: boolean;

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
     * Determines if the dropdown should react to keys to close like 'Esc'
     */
    @Input() keyboardHandler: boolean;

    @Output() onShown: EventEmitter<DropdownDirective>;
    @Output() onHidden: EventEmitter<DropdownDirective>;
    @Output() onKeyboard: EventEmitter<KeyboardEvent>;

    contentElement: HTMLElement;

    private readonly onTap: (event: Event) => void;
    private readonly onKeyDown: (event: KeyboardEvent) => void;

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
        this.attachToRoot = true;
        this.keyboardHandler = true;
        this.onShown = new EventEmitter<any>();
        this.onHidden = new EventEmitter<any>();
        this.onKeyboard = new EventEmitter<KeyboardEvent>();
        this.onTap = (event: Event): void => {
            const target = event.target as Node;
            if (event["button"]) return;
            if (!this.closeInside && (this.nativeElement?.contains(target) || this.contentElement?.contains(target))) {
                return;
            }
            setTimeout(() => this.hide(), event.type == "touchend" ? 250 : 100);
        };
        this.onKeyDown = (event: KeyboardEvent): void => {
            const input = event.target as HTMLInputElement;
            const notInput = input && input.tagName !== "INPUT" && input.tagName !== "TEXTAREA";
            if ("Tab" === event.key || !input || notInput) {
                event.stopPropagation();
                event.preventDefault();
            }
            if ("Esc" === event.key || "Escape" === event.key) {
                this.hide();
                return;
            }
            this.onKeyboard.emit(event);
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
            document.addEventListener("click", this.onTap);
            document.addEventListener("keydown", this.onKeyDown);
        }, 10);
        return true;
    }

    hide() {
        if (!this.opened) return true;
        this.opened = false;
        this.hideEvent();
        document.removeEventListener("click", this.onTap);
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
