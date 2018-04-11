import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    Output,
    Renderer2,
    SimpleChanges
} from "@angular/core";

declare const icons: {
    [icon: string]: string;
};

@Directive({
    selector: "[icon]"
})
export class IconDirective implements OnChanges {

    @Input() icon: string;
    @Input() active: boolean;
    @Output() activeChange: EventEmitter<boolean>;

    @HostBinding("class.active")
    get isActive() {
        return this.active;
    }

    constructor(private element: ElementRef, private renderer: Renderer2) {
        this.renderer.addClass(this.element.nativeElement, "svg-icon");
        this.activeChange = new EventEmitter<boolean>();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.icon) {
            this.renderer.removeClass(this.element.nativeElement, `svg-icon-${changes.icon.previousValue}`);
            this.renderer.addClass(this.element.nativeElement, `svg-icon-${changes.icon.currentValue}`);
        }
        this.changeIcon();
    }

    @HostListener("click")
    click(): void {
        this.active = !this.active;
        this.activeChange.emit(this.active);
        this.changeIcon();
    }

    private changeIcon(): void {
        const active = `${this.icon}-active`;
        const icon = typeof icons == "undefined" ? this.icon : (icons[this.icon] || this.icon);
        const activeIcon = typeof icons == "undefined" ? active : (icons[active] || icon);
        this.element.nativeElement.innerHTML = this.active ? activeIcon : icon;
    }
}
