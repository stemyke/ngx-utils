import {
    Directive,
    EmbeddedViewRef,
    Input,
    OnChanges,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef
} from "@angular/core";

@Directive({
    selector: "[ngxTemplateOutlet]"
})
export class NgxTemplateOutletDirective implements OnChanges {

    private viewRef: EmbeddedViewRef<any>;

    @Input() public context: Object;
    @Input() public additionalContext: Object;
    @Input() public ngxTemplateOutlet: TemplateRef<any>;

    private static hasContextShapeChanged(ctxChange: SimpleChange): boolean {
        const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        const currCtxKeys = Object.keys(ctxChange.currentValue || {});

        if (prevCtxKeys.length === currCtxKeys.length) {
            for (const propName of currCtxKeys) {
                if (prevCtxKeys.indexOf(propName) === -1) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }

    constructor(private _viewContainerRef: ViewContainerRef) {}

    ngOnChanges(changes: SimpleChanges) {
        const recreateView = this.shouldRecreateView(changes);
        if (recreateView) {
            if (this.viewRef)
                this._viewContainerRef.remove(this._viewContainerRef.indexOf(this.viewRef));
            if (this.ngxTemplateOutlet)
                this.viewRef = this._viewContainerRef.createEmbeddedView(this.ngxTemplateOutlet, {});
        }
        if (!this.viewRef) return;
        const context = this.viewRef.context;
        this.updateExistingContext(this.context, context);
        this.updateExistingContext(this.additionalContext, context);
        context.$implicit = context;
    }

    private shouldRecreateView(changes: SimpleChanges): boolean {
        const ctxChange = changes["context"];
        const aCtxChange = changes["additionalContext"];
        return !!changes["ngxTemplateOutlet"]
            || (ctxChange && NgxTemplateOutletDirective.hasContextShapeChanged(ctxChange))
            || (aCtxChange && NgxTemplateOutletDirective.hasContextShapeChanged(aCtxChange));
    }

    private updateExistingContext(ctx: any, context: any): void {
        if (!ctx) return;
        let ctxProto = Object.getPrototypeOf(ctx);
        if (ctxProto == Object.prototype) {
            ctxProto = ctx;
        }
        const props = Object.getOwnPropertyNames(ctxProto);
        for (const propName of props) {
            const desc = Object.getOwnPropertyDescriptor(ctxProto, propName);
            // Copy if its a getter and it is not $implicit
            if (desc.get && propName !== "$implicit") Object.defineProperty(context, propName, desc);
        }
        for (const propName of Object.keys(ctx)) {
            const desc = Object.getOwnPropertyDescriptor(ctxProto, propName);
            if (desc && desc.get && !desc.set) continue;
            context[propName] = ctx[propName];
        }
    }
}
