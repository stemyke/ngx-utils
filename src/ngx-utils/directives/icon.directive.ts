import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges
} from "@angular/core";
import {Subscription} from "rxjs";
import {IIconService} from "../common-types";
import {ICON_SERVICE} from "../tokens";

@Directive({
    standalone: false,
    selector: "i[icon],b[icon],p[icon],span[icon],a[icon],h1[icon],h2[icon],h3[icon],h4[icon]"
})
export class IconDirective implements OnChanges, OnInit, OnDestroy {

    @Input() icon: string;
    @Input() activeIcon: string;
    @Input() active: boolean;
    @Output() activeChange: EventEmitter<boolean>;

    @HostBinding("class.active")
    get isActive() {
        return this.active;
    }

    protected iconsLoaded: Subscription;

    constructor(private element: ElementRef, private renderer: Renderer2, @Inject(ICON_SERVICE) private icons: IIconService) {
        this.renderer.addClass(this.element.nativeElement, "svg-icon");
        this.activeChange = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
        this.iconsLoaded = this.icons.iconsLoaded.subscribe(() => this.changeIcon());
    }

    ngOnDestroy(): void {
        if (this.iconsLoaded)
            this.iconsLoaded.unsubscribe();
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
            if (this.icons.isDisabled) return;
            this.element.nativeElement.innerHTML = icon;
        });
    }
}
