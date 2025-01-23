import {ChangeDetectorRef, Directive, ElementRef, Inject, Input} from "@angular/core";
import {DropdownDirective} from "./dropdown.directive";
import {AsyncMethodBase} from "./async-method.base";
import {AsyncMethod, IToasterService, TOASTER_SERVICE} from "../common-types";

@Directive({
    standalone: false,
    selector: "[dropdownToggle]",
    exportAs: "dropdown-toggle",
})
export class DropdownToggleDirective extends AsyncMethodBase {

    @Input() beforeOpen: AsyncMethod;

    constructor(readonly element: ElementRef,
                readonly dropdown: DropdownDirective,
                @Inject(TOASTER_SERVICE) toaster: IToasterService,
                cdr: ChangeDetectorRef) {
        super(toaster, cdr);
    }

    protected getMethod(): AsyncMethod {
        return this.beforeOpen;
    }

    callMethod(): boolean {
        if (this.dropdown.isOpened) {
            this.dropdown.hide();
        } else if (!super.callMethod()) {
            this.dropdown.show();
        }
        return true;
    }
}
