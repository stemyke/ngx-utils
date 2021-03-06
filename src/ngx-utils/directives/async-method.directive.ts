import {EventEmitter, Inject, Input, Output, Directive, HostBinding, HostListener} from "@angular/core";
import {TOASTER_SERVICE, IToasterService, IAsyncMessage, AsyncMethod} from "../common-types";

@Directive({
    selector: "[async-method]",
    exportAs: "async-method"
})
export class AsyncMethodDirective {

    @Input("async-method") method: AsyncMethod;
    @Input() disabled: boolean;
    @Input() context: any;

    @Output() onSuccess: EventEmitter<IAsyncMessage>;
    @Output() onError: EventEmitter<IAsyncMessage>;

    private loading: boolean;

    @HostBinding("class.disabled")
    get isDisabled(): boolean {
        return this.disabled;
    }

    @HostBinding("class.loading")
    get isLoading(): boolean {
        return this.loading;
    }

    constructor(@Inject(TOASTER_SERVICE) private toaster: IToasterService) {
        this.onSuccess = new EventEmitter<IAsyncMessage>();
        this.onError = new EventEmitter<IAsyncMessage>();
    }

    @HostListener("click")
    click(): void {
        if (this.disabled) return;
        this.callMethod();
    }

    callMethod(): void {
        if (this.loading) return;
        this.loading = true;
        this.method(this.context).then(result => {
            this.loading = false;
            if (result) {
                this.onSuccess.emit(result);
                this.toaster.success(result.message, result.context);
            }
        }, reason => {
            if (!reason || !reason.message)
                throw new Error("Reason must implement IAsyncMessage interface");
            this.loading = false;
            this.onError.emit(reason);
            this.toaster.error(reason.message, reason.context);
        });
    }
}
