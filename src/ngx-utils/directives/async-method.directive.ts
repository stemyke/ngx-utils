import {Directive, input, untracked} from "@angular/core";
import {AsyncMethod} from "../common-types";
import {AsyncMethodBase} from "./async-method.base";

@Directive({
    standalone: false,
    selector: "[async-method]",
    exportAs: "async-method",
    providers: [
        {provide: AsyncMethodBase, useExisting: AsyncMethodDirective}
    ]
})
export class AsyncMethodDirective extends AsyncMethodBase {

    readonly method = input<AsyncMethod>(null, {alias: "async-method"});

    protected getMethod() {
        return untracked(() => this.method());
    }
}
