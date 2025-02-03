import {Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output} from "@angular/core";

@Directive({
    standalone: false,
    selector: "[dd],[drop-down]",
    exportAs: "dropdown"
})
export class DropdownDirective implements OnDestroy {

    protected static active: DropdownDirective = null;

    protected opened: boolean;
    protected disabled: boolean;

    @Input() closeInside: boolean;
    @Input() keyboardHandler: boolean;
    @Output() onShown: EventEmitter<DropdownDirective>;
    @Output() onHidden: EventEmitter<DropdownDirective>;
    @Output() onKeyboard: EventEmitter<KeyboardEvent>;

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
        this.keyboardHandler = true;
        this.onShown = new EventEmitter<any>();
        this.onHidden = new EventEmitter<any>();
        this.onKeyboard = new EventEmitter<KeyboardEvent>();
        this.onTap = (event: Event): void => {
            const target = event.target as Node;
            if (event["button"]) return;
            if (this.nativeElement && this.nativeElement.contains(target) && !this.closeInside) {
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

    setProperty(name: string, value: any): void {
        const elem = this.element.nativeElement;
        if (!elem) return;
        elem.style.setProperty(`--${name}`, value);
    }

    @HostListener("keydown.enter", ["$event"])
    @HostListener("keydown.space", ["$event"])
    show($event?: Event): void {
        if (this.opened) return;
        if ($event) {
            if (!this.keyboardHandler) return;
            $event.stopPropagation();
            $event.preventDefault();
        }
        if (this.disabled) return;
        this.opened = true;
        this.showEvent();
        DropdownDirective.active = this;
        // Prevent toggle from selecting an item right after it is shown
        setTimeout(() => {
            if (!this.opened) return;
            document.addEventListener("touchend", this.onTap);
            document.addEventListener("mouseup", this.onTap);
            document.addEventListener("keydown", this.onKeyDown);
        }, 10);
    }

    hide(): void {
        if (!this.opened) return;
        this.opened = false;
        this.hideEvent();
        document.removeEventListener("touchend", this.onTap);
        document.removeEventListener("mouseup", this.onTap);
        document.removeEventListener("keydown", this.onKeyDown);
        // Prevent toggle from refocus itself after it is hidden because of another toggle
        setTimeout(() => {
            if (DropdownDirective.active === this) {
                DropdownDirective.active = null;
                this.nativeElement?.focus();
            }
        }, 10);
    }
}
