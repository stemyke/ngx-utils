import {Directive, ElementRef, inject, input, OnDestroy, OnInit} from "@angular/core";

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

    readonly element = inject(ElementRef);
}
