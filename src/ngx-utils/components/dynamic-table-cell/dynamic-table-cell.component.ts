import {Component, computed, inject, input, TemplateRef, ViewEncapsulation} from "@angular/core";
import {toSignal} from "@angular/core/rxjs-interop";
import {ITableColumn} from "../../common-types";
import {LANGUAGE_SERVICE} from "../../tokens";

import {GlobalTemplateService} from "../../services/global-template.service";
import {ObjectUtils} from "../../utils/object.utils";

@Component({
    standalone: false,
    selector: "dynamic-table-cell",
    templateUrl: "./dynamic-table-cell.component.html",
    encapsulation: ViewEncapsulation.None
})
export class DynamicTableCellComponent {

    readonly language = inject(LANGUAGE_SERVICE);
    readonly globalTemplates = inject(GlobalTemplateService);

    readonly item = input<Record<string, any>>({});
    readonly column = input<ITableColumn>({title: ""});
    readonly id = input("");
    readonly globalTemplatePrefix = input("dynamic-table");
    readonly fallbackTemplate = input<TemplateRef<any>>(null);

    readonly templateKeys = toSignal(this.globalTemplates.templatesUpdated);
    readonly template = computed(() => {
        const prefix = this.globalTemplatePrefix();
        const key = `${prefix}-col-${this.id()}`;
        const keys = this.templateKeys();
        return !keys?.includes(key) ? null : this.globalTemplates.get(key);
    });
    readonly context = computed(() => {
        const item = this.item();
        const id = this.id();
        const value = ObjectUtils.getValue(item, id, null);
        return {
            item, id, value,
            column: this.column(),
            multi: Array.isArray(value)
        };
    });
}
