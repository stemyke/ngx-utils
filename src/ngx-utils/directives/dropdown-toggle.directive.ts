import {Directive, inject, input} from "@angular/core";
import {DropdownDirective} from "./dropdown.directive";
import {AsyncMethodBase} from "./async-method.base";
import {AsyncMethod} from "../common-types";

@Directive({
    standalone: false,
    selector: "[dropdownToggle]",
    exportAs: "dropdown-toggle",
    providers: [
        {provide: AsyncMethodBase, useExisting: DropdownToggleDirective}
    ]
})
export class DropdownToggleDirective extends AsyncMethodBase {

    readonly beforeOpen = input<AsyncMethod>(null);
    readonly switch = input(true);
    readonly dropdown = inject(DropdownDirective);

    protected getMethod(): AsyncMethod {
        return this.beforeOpen();
    }

    callMethod(ev: MouseEvent): boolean {
        if (this.dropdown.isOpened) {
            if (!this.switch()) return true;
            this.dropdown.hide();
        } else if (!super.callMethod(ev)) {
            this.dropdown.show();
        }
        return true;
    }
}
