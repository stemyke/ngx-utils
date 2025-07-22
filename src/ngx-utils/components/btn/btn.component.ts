import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    ViewEncapsulation
} from "@angular/core";
import {ButtonProps, ButtonSize, ButtonType} from "../../common-types";
import {BUTTON_TYPE} from "../../tokens";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "btn",
    templateUrl: "./btn.component.html"
})
export class BtnComponent {

    readonly label = input("");
    readonly tooltip = input("");
    readonly icon = input("");
    readonly disabled = input(false);
    readonly type = input("primary" as ButtonType);
    readonly size = input("normal" as ButtonSize);

    readonly buttonType = inject(BUTTON_TYPE);
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly buttonProps = computed<ButtonProps>(() => {
        return {
            label: this.label(),
            tooltip: this.tooltip(),
            icon: this.icon(),
            disabled: this.disabled(),
            type: this.type(),
            size: this.size()
        };
    });

    contains(target: EventTarget): boolean {
        return !(target instanceof HTMLElement) || this.element.nativeElement?.contains(target);
    }

}
