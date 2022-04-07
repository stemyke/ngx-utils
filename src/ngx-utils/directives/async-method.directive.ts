import {Directive, Inject, Input} from "@angular/core";
import {AsyncMethod, IToasterService, TOASTER_SERVICE} from "../common-types";
import {AsyncMethodBase} from "./async-method.base";

@Directive({
    selector: "[async-method]",
    exportAs: "async-method"
})
export class AsyncMethodDirective extends AsyncMethodBase {

    @Input("async-method") method: AsyncMethod;

    constructor(@Inject(TOASTER_SERVICE) toaster: IToasterService) {
        super(toaster);
    }

    protected getMethod(): AsyncMethod {
        return this.method;
    }
}
