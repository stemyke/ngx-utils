import {ChangeDetectorRef, Directive, ElementRef, Inject, Input} from "@angular/core";
import {DropdownDirective} from "./dropdown.directive";
import {AsyncMethodBase} from "./async-method.base";
import {AsyncMethod, IToasterService} from "../common-types";
import {TOASTER_SERVICE} from "../tokens";

@Directive({
    standalone: false,
    selector: "[dropdownToggle]",
    exportAs: "dropdown-toggle",
})
export class DropdownToggleDirective extends AsyncMethodBase {

    @Input() beforeOpen: AsyncMethod;
    @Input() switch: boolean;

    constructor(readonly element: ElementRef,
                readonly dropdown: DropdownDirective,
                @Inject(TOASTER_SERVICE) toaster: IToasterService,
                cdr: ChangeDetectorRef) {
        super(toaster, cdr);
        this.switch = true;
    }

    protected getMethod(): AsyncMethod {
        return this.beforeOpen;
    }

    callMethod(ev: MouseEvent): boolean {
        if (this.dropdown.isOpened) {
            if (!this.switch) return true;
            this.dropdown.hide();
        } else if (!super.callMethod(ev)) {
            this.dropdown.show();
        }
        return true;
    }
}
