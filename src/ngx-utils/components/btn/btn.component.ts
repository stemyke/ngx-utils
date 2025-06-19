import {ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation} from "@angular/core";
import {ButtonProps, ButtonSize, ButtonState, ButtonStyle} from "../../common-types";
import {BUTTON_TYPE} from "../../tokens";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "btn",
    templateUrl: "./btn.component.html",
    styleUrls: ["./btn.component.scss"]
})
export class BtnComponent {

    readonly label = input("");
    readonly tooltip = input("");
    readonly icon = input("");
    readonly disabled = input(false);
    readonly style = input("primary" as ButtonStyle);
    readonly size = input("normal" as ButtonSize);
    readonly state = input("inactive" as ButtonState);

    readonly buttonType = inject(BUTTON_TYPE);

    readonly buttonProps = computed<ButtonProps>(() => {
        return {
            label: this.label(),
            tooltip: this.tooltip(),
            icon: this.icon(),
            disabled: this.disabled(),
            style: this.style(),
            size: this.size(),
            state: this.state()
        };
    });

}
