import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    effect, inject,
    input,
    model,
    output,
    signal,
    TemplateRef,
    ViewEncapsulation
} from "@angular/core";
import {Router, UrlSerializer, UrlTree} from "@angular/router";

import {AsyncMethod, ButtonSize, ButtonType, IAsyncMessage, TabOption, TabValue} from "../../common-types";
import {TabsItemDirective} from "../../directives/tabs-item.directive";
import {switchClass} from "../../utils/misc";
import {ObjectUtils} from "../../utils/object.utils";

export interface ExtendedTabOption extends Omit<TabOption, "path"> {
    active?: boolean;
    template?: TemplateRef<any>;
    className?: string;
    path?: string;
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

    readonly urlSerializer = inject(UrlSerializer);
    readonly router = inject(Router);
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
        const options: ExtendedTabOption[] = (this.options() || [])
            .filter(option => ObjectUtils.isStringWithValue(option?.label))
            .map(option => {
                const path = !option.path
                    ? null
                    : (option.path instanceof UrlTree ? this.urlSerializer.serialize(option.path) : option.path);
                return {
                    ...option,
                    path
                } satisfies ExtendedTabOption;
            });
        const current = this.value();
        this.tabItems().forEach(item => {
            const value = item.value();
            switchClass(item.element?.nativeElement, "hidden-tab", current !== value);

            if (options.some(o => o.value === value)) return;

            const label = item.label();

            if (!label) return;

            const path = item.path();

            options.push({
                value,
                label,
                classes: item.classes(),
                tooltip: item.tooltip(),
                icon: item.icon(),
                disabled: item.disabled(),
                path: !path
                    ? null
                    : (path instanceof UrlTree ? this.urlSerializer.serialize(path) : path),
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

    readonly select: AsyncMethod = async (option: ExtendedTabOption): Promise<IAsyncMessage> => {
        if (option.path) {
            await this.router.navigateByUrl(option.path);
            return null;
        }
        this.value.set(option.value);
        this.selectedChange.emit(option);
        return null;
    };

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
}
