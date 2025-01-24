import {Directive, Input, ViewContainerRef, OnChanges, SimpleChanges, ComponentRef, OnDestroy} from "@angular/core";
import {ComponentLoaderService} from "../services/component-loader.service";

@Directive({
    standalone: false,
    selector: "[loadComponent]"
})
export class ComponentLoaderDirective implements OnChanges, OnDestroy {

    @Input() module: string;
    @Input("loadComponent") selector: string;

    private cr: ComponentRef<any>;

    constructor(private vcr: ViewContainerRef, private loader: ComponentLoaderService) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.module || !this.selector) return;
        this.ngOnDestroy();
        this.loader.getComponentType({
            moduleId: this.module,
            selector: this.selector
        }).then(type => {
            this.cr = this.vcr.createComponent(type);
            this.cr.changeDetectorRef.markForCheck();
            this.cr.changeDetectorRef.detectChanges();
        });
    }

    ngOnDestroy(): void {
        if (!this.cr) return;
        this.cr.destroy();
        const index = this.vcr.indexOf(this.cr.hostView);
        if (index >= 0) {
            this.vcr.remove(index);
        }
        this.cr.hostView.destroy();
    }
}
