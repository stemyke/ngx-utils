import {Component} from "@angular/core";
import "../../extensions";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    title = "app".pad(10);
}
