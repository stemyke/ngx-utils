import {Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "dropdown-box",
    styleUrls: ["./dropdown-box.component.scss"],
    templateUrl: "./dropdown-box.component.html",
})
export class DropdownBoxComponent {

    @Input() closeInside: boolean;
    @Input() attachToRoot: boolean;
    @Input() componentClass: string;

    constructor() {
        this.closeInside = true;
        this.attachToRoot = true;
        this.componentClass = "drop";
    }
}
