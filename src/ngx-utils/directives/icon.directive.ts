import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnChanges,
    Output,
    Renderer2,
    SimpleChanges
} from "@angular/core";
import {ICON_SERVICE, IIconService} from "../common-types";

@Directive({
    selector: "[icon]"
})
export class IconDirective implements OnChanges {

    @Input() icon: string;
    @Input() activeIcon: string;
    @Input() active: boolean;
    @Output() activeChange: EventEmitter<boolean>;

    @HostBinding("class.active")
    get isActive() {
        return this.active;
    }

    constructor(private element: ElementRef, private renderer: Renderer2, @Inject(ICON_SERVICE) private icons: IIconService) {
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
        this.icons.getIcon(this.icon, this.activeIcon || `${this.icon}-active`, this.active).then(icon => {
            this.element.nativeElement.innerHTML = icon;
        });
    }
}
