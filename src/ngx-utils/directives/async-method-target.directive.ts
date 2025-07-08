import {Directive, ElementRef, Optional} from "@angular/core";
import {AsyncMethodBase} from "./async-method.base";
import {switchClass} from "../utils/misc";

@Directive({
    standalone: false,
    selector: "[async-method-target]"
})
export class AsyncMethodTargetDirective {

    constructor(protected element: ElementRef,
                @Optional() protected asyncMethod: AsyncMethodBase) {
        if (!asyncMethod) {
            switchClass(this.element.nativeElement, "async-target", true);
            return;
        }
        asyncMethod.target.set(element.nativeElement);
    }

}
