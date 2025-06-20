import {ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation} from "@angular/core";
import {IconProps} from "../../common-types";
import {ICON_MAP, ICON_TYPE} from "../../tokens";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "icon",
    templateUrl: "./icon.component.html"
})
export class IconComponent {

    readonly name = input("trash");

    readonly iconType = inject(ICON_TYPE);

    readonly iconMap = inject(ICON_MAP);

    readonly iconProps = computed<IconProps>(() => {
        const name = this.name();
        return {
            name: this.iconMap[name] || name,
        };
    });

}
