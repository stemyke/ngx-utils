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
    Renderer2,
    signal
} from "@angular/core";
import {AsyncMethod, IAsyncMessage} from "../common-types";
import {TOASTER_SERVICE} from "../tokens";

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
    readonly renderer = inject(Renderer2);
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly loading = signal(false);
    readonly target = signal(this.element.nativeElement);

    constructor() {
        effect(() => {
            const disabled = this.disabled();
            const loading = this.loading();
            const target = this.target();
            if (!target) return;
            if (disabled) {
                this.renderer.addClass(target, "disabled");
            } else {
                this.renderer.removeClass(target, "disabled");
            }
            if (loading) {
                this.renderer.addClass(target, "loading");
            } else {
                this.renderer.removeClass(target, "loading");
            }
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
