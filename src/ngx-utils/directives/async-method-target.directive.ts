import {Directive, ElementRef, Optional} from "@angular/core";
import {AsyncMethodBase} from "./async-method.base";

@Directive({
    standalone: false,
    selector: "[async-method-target]"
})
export class AsyncMethodTargetDirective {

    constructor(protected element: ElementRef,
                @Optional() protected asyncMethod: AsyncMethodBase) {
        if (!asyncMethod) return;
        asyncMethod.target.set(element.nativeElement);
    }

}
