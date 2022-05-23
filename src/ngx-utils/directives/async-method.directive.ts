import {Directive, Input} from "@angular/core";
import {AsyncMethod} from "../common-types";
import {AsyncMethodBase} from "./async-method.base";

@Directive({
    selector: "[async-method]",
    exportAs: "async-method"
})
export class AsyncMethodDirective extends AsyncMethodBase {

    @Input("async-method") method: AsyncMethod;

    protected getMethod(): AsyncMethod {
        return this.method;
    }
}
