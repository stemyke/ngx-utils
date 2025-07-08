import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren, effect,
    inject,
    input,
    model, output,
    Renderer2,
    ViewEncapsulation
} from "@angular/core";
import {ButtonSize, ButtonType, TabOption, TabValue} from "../../common-types";
import {TabsItemDirective} from "../../directives/tabs-item.directive";

export interface ExtendedTabOption extends TabOption {
    active?: boolean;
    className?: string;
}

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "tabs",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"]
})
export class TabsComponent {

    readonly value = model<TabValue>();
    readonly options = input<TabOption[]>([]);
    readonly type = input("primary" as ButtonType);
    readonly size = input("normal" as ButtonSize);
    readonly tabItems = contentChildren(TabsItemDirective);
    readonly selectedChange = output<TabOption>();
    readonly renderer = inject(Renderer2);

    readonly tabs = computed(() => {
        const options = Array.from(this.options() || []) as ExtendedTabOption[];
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
                classes: item.classes(),
                label: item.label(),
                tooltip: item.tooltip(),
                icon: item.icon(),
                disabled: item.disabled(),
            });
        });
        options.forEach(o => {
            const active = current === o.value;
            const classes = (Array.isArray(o.classes) ? o.classes : [o.classes || ""]).filter(c => !!c);
            classes.push(active ? "active" : "inactive");
            o.active = active;
            o.className = classes.join(" ");
        });
        return options;
    });

    constructor() {
        effect(() => {
            const tabOptions = this.tabs();
            const selectedOption = tabOptions.find(o => o.active);
            if (tabOptions.length && !selectedOption) {
                this.value.set(tabOptions[0].value);
            }
        });
    }

    select(option: TabOption): void {
        this.value.set(option.value);
        this.selectedChange.emit(option);
    }
}
