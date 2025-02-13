import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input, OnChanges,
    Output
} from "@angular/core";
import {AsyncMethod, IAsyncMessage, IToasterService, TOASTER_SERVICE} from "../common-types";

@Directive({
    standalone: false,
    selector: "[__asmb__]"
})
export class AsyncMethodBase implements OnChanges {

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

    constructor(@Inject(TOASTER_SERVICE) protected toaster: IToasterService, protected cdr: ChangeDetectorRef) {
        this.onSuccess = new EventEmitter<IAsyncMessage>();
        this.onError = new EventEmitter<IAsyncMessage>();
    }

    protected getMethod(): AsyncMethod {
        return async () => null;
    }

    ngOnChanges(): void {
        this.cdr.detectChanges();
    }

    @HostListener("click", ["$event"])
    click(ev: Event) {
        ev?.preventDefault();
        if (this.disabled) return true;
        this.callMethod();
        return true;
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
        }).finally(() => {
            if (!this.cdr["destroyed"]) {
                this.cdr.detectChanges();
            }
        });
        return true;
    }
}
