import {ChangeDetectionStrategy, Component, input, model, ViewEncapsulation} from "@angular/core";
import {ButtonSize, ButtonStyle, TabOption} from "../../common-types";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "tabs",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"]
})
export class TabsComponent {

    readonly value = model()
    readonly options = input<TabOption[]>([]);
    readonly style = input("primary" as ButtonStyle);
    readonly size = input("normal" as ButtonSize);

    select(option: TabOption): void {
        this.value.set(option.value);
    }
}
