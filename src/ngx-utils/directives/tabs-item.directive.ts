import {Directive, ElementRef, inject, input} from "@angular/core";

@Directive({
    standalone: false,
    selector: "[tabsItem]"
})
export class TabsItemDirective {

    readonly value = input(null, {alias: "tabsItem"});
    readonly label = input("");
    readonly tooltip = input("");
    readonly icon = input("");
    readonly disabled = input(false);
    readonly classes = input<string | string[]>("");

    readonly element = inject(ElementRef);
}
