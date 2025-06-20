import {Component, Input, ViewEncapsulation} from "@angular/core";
import {ButtonProps, ButtonSize, ButtonType} from "../../common-types";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "btn-default",
    templateUrl: "./btn-default.component.html",
    styleUrls: ["./btn-default.component.scss"]
})
export class BtnDefaultComponent implements ButtonProps {

    @Input() label: string;
    @Input() tooltip: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    @Input() type: ButtonType;
    @Input() size: ButtonSize;

}
