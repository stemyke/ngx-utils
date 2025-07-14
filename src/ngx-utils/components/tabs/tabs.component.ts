import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    effect,
    input,
    model,
    output, signal,
    TemplateRef,
    ViewEncapsulation
} from "@angular/core";
import {ButtonSize, ButtonType, TabOption, TabValue} from "../../common-types";
import {TabsItemDirective} from "../../directives/tabs-item.directive";
import {switchClass} from "../../utils/misc";

export interface ExtendedTabOption extends TabOption {
    active?: boolean;
    template?: TemplateRef<any>;
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
    readonly testId = input("tabs");
    readonly tabsClass = input("basic-tabs");
    readonly tabItems = contentChildren(TabsItemDirective);
    readonly selectedChange = output<TabOption>();
    readonly template = signal<TemplateRef<any>>(null);

    readonly tabs = computed(() => {
        const options = Array.from(this.options() || []) as ExtendedTabOption[];
        const current = this.value();
        this.tabItems().forEach(item => {
            const value = item.value();
            switchClass(item.element?.nativeElement, "hidden-tab", current !== value);

            if (options.some(o => o.value === value)) return;

            const label = item.label();

            if (!label) return;

            options.push({
                value,
                label,
                classes: item.classes(),
                tooltip: item.tooltip(),
                icon: item.icon(),
                disabled: item.disabled(),
                template: item.template
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
                return;
            }
            if (selectedOption) {
                this.template.set(selectedOption.template);
            }
        });
    }

    select(option: TabOption): void {
        this.value.set(option.value);
        this.selectedChange.emit(option);
    }
}
