import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    inject,
    input,
    model,
    Renderer2,
    ViewEncapsulation
} from "@angular/core";
import {ButtonSize, ButtonType, TabOption} from "../../common-types";
import {TabsItemDirective} from "../../directives/tabs-item.directive";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "tabs",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"]
})
export class TabsComponent {

    readonly value = model()
    readonly options = input<TabOption[]>([]);
    readonly type = input("primary" as ButtonType);
    readonly size = input("normal" as ButtonSize);
    readonly tabItems = contentChildren(TabsItemDirective);
    readonly renderer = inject(Renderer2);

    readonly tabs = computed(() => {
        const options = Array.from(this.options() || []);
        const current = this.value();
        this.tabItems().forEach(item => {
            const value = item.value();
            if (current === value) {
                this.renderer.removeClass(item.element.nativeElement, "hidden-tab");
            } else {
                this.renderer.addClass(item.element.nativeElement, "hidden-tab");
            }
            if (options.some(o => o.value === value)) return;
            options.push({
                value,
                label: item.label(),
                tooltip: item.tooltip(),
                icon: item.icon(),
                disabled: item.disabled(),
            });
        });
        options.forEach(o => {
            o.active = current === o.value;
        });
        return options;
    });

    select(value: any): void {
        this.value.set(value);
    }
}
