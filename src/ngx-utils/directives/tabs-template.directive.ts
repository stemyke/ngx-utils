import {Directive, input} from "@angular/core";
import {TabsItemDirective} from "./tabs-item.directive";

@Directive({
    standalone: false,
    selector: "ng-template[tab]",
    providers: [
        {provide: TabsItemDirective, useExisting: TabsTemplateDirective}
    ],
})
export class TabsTemplateDirective extends TabsItemDirective {

    readonly value = input(null, {alias: "tab"});

}
