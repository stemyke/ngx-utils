import {
    ChangeDetectorRef,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    input,
    OnChanges,
    output,
    signal
} from "@angular/core";
import {AsyncMethod, IAsyncMessage} from "../common-types";
import {TOASTER_SERVICE} from "../tokens";
import {computedPrevious} from "../utils/signal-utils";
import {switchClass} from "../utils/misc";

@Directive({
    standalone: false,
    selector: "[__asmb__]"
})
export class AsyncMethodBase implements OnChanges {

    readonly disabled = signal(false);
    readonly context = input<any>({});

    readonly onSuccess = output<IAsyncMessage>();
    readonly onError = output<IAsyncMessage>();
    readonly toaster = inject(TOASTER_SERVICE);
    readonly cdr = inject(ChangeDetectorRef);
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly loading = signal(false);
    readonly target = signal(this.element.nativeElement);
    readonly previousTarget = computedPrevious(this.target);

    constructor() {
        effect(() => {
            const target = this.target();
            if (!target) return;
            switchClass(target, "async-target", true);
            switchClass(target, "disabled", this.disabled());
            switchClass(target, "loading", this.loading());
        });
        effect(() => {
            const previous = this.previousTarget();
            if (!previous) return;
            switchClass(previous, "async-target", false);
            switchClass(previous, "disabled", false);
            switchClass(previous, "loading", false);
        });
    }

    protected getMethod(): AsyncMethod {
        return async () => null;
    }

    ngOnChanges(): void {
        this.cdr.detectChanges();
    }

    @HostListener("click", ["$event"])
    click(ev: MouseEvent) {
        ev?.preventDefault();
        if (this.disabled()) return true;
        this.callMethod(ev);
        return true;
    }

    callMethod(ev?: MouseEvent): boolean {
        if (this.loading()) return true;
        this.loading.set(true);
        const method = this.getMethod();
        const result = !method ? null : method(this.context(), ev);
        if (!(result instanceof Promise)) {
            this.loading.set(false);
            return false;
        }
        result.then(result => {
            this.loading.set(false);
            if (result) {
                this.onSuccess.emit(result);
                this.toaster.success(result.message, result.context);
            }
        }, reason => {
            if (!reason || !reason.message)
                throw new Error("Reason must implement IAsyncMessage interface");
            this.loading.set(false);
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
