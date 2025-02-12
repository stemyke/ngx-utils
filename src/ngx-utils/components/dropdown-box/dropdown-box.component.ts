import {Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "dropdown-box",
    styleUrls: ["./dropdown-box.component.scss"],
    templateUrl: "./dropdown-box.component.html",
})
export class DropdownBoxComponent {
    @Input() classes: string;
}
