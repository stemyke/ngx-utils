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
    signal, untracked
} from "@angular/core";
import {AsyncMethod, IAsyncMessage} from "../common-types";
import {TOASTER_SERVICE} from "../tokens";
import {computedPrevious} from "../utils/signal-utils";
import {switchClass} from "../utils/misc";

async function defaultMethod(): Promise<IAsyncMessage> {
    return null;
}

@Directive({
    standalone: false,
    selector: "[__asmb__]"
})
export class AsyncMethodBase<T extends AsyncMethod = AsyncMethod> implements OnChanges {

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

    ngOnChanges(): void {
        this.cdr.detectChanges();
    }

    @HostListener("click", ["$event"])
    onClick(ev: MouseEvent) {
        return this.handleClick(ev);
    }

    callMethod(ev?: MouseEvent): boolean {
        if (this.loading()) return true;
        this.loading.set(true);
        const method = this.getMethod() || defaultMethod;
        const result = method(...this.getArgs(ev));
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

    protected handleClick(ev: MouseEvent): boolean {
        ev?.preventDefault();
        if (this.disabled()) return true;
        this.callMethod(ev);
        return true;
    }

    protected getMethod(): T {
        return null;
    }

    protected getArgs(ev: MouseEvent): unknown[] {
        return untracked(() => [this.context(), ev]);
    }
}
