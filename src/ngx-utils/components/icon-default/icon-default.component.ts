import {Component, Input, ViewEncapsulation} from "@angular/core";
import {IconProps} from "../../common-types";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "icon-default",
    templateUrl: "./icon-default.component.html",
    styleUrls: ["./icon-default.component.scss"]
})
export class IconDefaultComponent implements IconProps {

    @Input() name: string = "trash";

}
