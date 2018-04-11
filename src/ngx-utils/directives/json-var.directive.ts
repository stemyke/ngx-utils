import {ChangeDetectorRef, Directive, Input, OnInit, Optional, TemplateRef, ViewContainerRef} from "@angular/core";

export class VariableHolder {
    vars: any = {};
}

@Directive({
    selector: "[jsonVar]",
    exportAs: "json-var"
})
export class JsonVarDirective implements OnInit {

    @Input("jsonVar") varName: string;

    data: any = null;

    constructor(public cdr: ChangeDetectorRef, vcr: ViewContainerRef, tr: TemplateRef<any>, @Optional() private holder: VariableHolder = null) {
        const ev = vcr.createEmbeddedView(tr);
        try {
            this.data = JSON.parse(ev.rootNodes[1].wholeText);
        } catch (e) {
            console.log("Error parsing JSON");
        }
        vcr.clear();
    }

    ngOnInit(): void {
        const name = this.varName;
        if (!this.holder || !name) return;
        this.holder.vars = this.holder.vars || {};
        this.holder.vars[name] = this.data;
        this.holder[name] = this.data;
        this.cdr.detectChanges();
    }
}
