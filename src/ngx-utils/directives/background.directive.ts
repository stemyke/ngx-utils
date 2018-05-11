import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FileUtils} from "../utils/file.utils";
import {UniversalService} from "../services/universal.service";

const defaultClass = "default-image";
const loadingClass = "loading-image";

@Directive({
    selector: "[background]"
})
export class BackgroundDirective implements OnChanges {

    @Input() background: string;
    @Input() backgroundSize: string;

    constructor(private http: HttpClient, private element: ElementRef, private renderer: Renderer2, private universal: UniversalService) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.universal.isServer) {
            this.setBackground(this.background);
            return;
        }
        this.renderer.removeClass(this.element.nativeElement, defaultClass);
        this.renderer.addClass(this.element.nativeElement, loadingClass);
        FileUtils.readDataFromUrl(this.http, this.background).then(url => {
            this.setBackground(url);
        }, () => {
            this.renderer.removeClass(this.element.nativeElement, loadingClass);
            this.renderer.addClass(this.element.nativeElement, defaultClass);
        });
    }

    private setBackground(url: string): void {
        this.renderer.removeClass(this.element.nativeElement, loadingClass);
        this.renderer.setStyle(this.element.nativeElement, "background-image", `url('${url}')`);
        if (!this.backgroundSize) return;
        this.renderer.setStyle(this.element.nativeElement, "background-size", this.backgroundSize);
    }
}
