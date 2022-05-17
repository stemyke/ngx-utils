import {EventEmitter, HostBinding, HostListener, Injectable, Input, Output} from "@angular/core";
import {AsyncMethod, IAsyncMessage, IToasterService} from "../common-types";

@Injectable()
export abstract class AsyncMethodBase {

    @Input() disabled: boolean;
    @Input() context: any;

    @Output() onSuccess: EventEmitter<IAsyncMessage>;
    @Output() onError: EventEmitter<IAsyncMessage>;

    protected loading: boolean;

    @HostBinding("class.disabled")
    get isDisabled(): boolean {
        return this.disabled;
    }

    @HostBinding("class.loading")
    get isLoading(): boolean {
        return this.loading;
    }

    protected constructor(protected toaster: IToasterService) {
        this.onSuccess = new EventEmitter<IAsyncMessage>();
        this.onError = new EventEmitter<IAsyncMessage>();
    }

    protected abstract getMethod(): AsyncMethod;

    @HostListener("click")
    click(): void {
        if (this.disabled) return;
        this.callMethod();
    }

    callMethod(): boolean {
        if (this.loading) return true;
        this.loading = true;
        const method = this.getMethod();
        const result = !method ? null : method(this.context);
        if (!(result instanceof Promise)) {
            this.loading = false;
            return false;
        }
        result.then(result => {
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
        return true;
    }
}
