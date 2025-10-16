import {Component, effect, input, untracked} from "@angular/core";
import {IShape} from "../../common-types";
import {Rect} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";

@Component({
    standalone: false,
    selector: "interactive-rect",
    template: "",
    providers: [
        {provide: InteractiveItemComponent, useExisting: InteractiveRectComponent},
    ]
})
export class InteractiveRectComponent extends InteractiveItemComponent {

    readonly width = input(10);
    readonly height = input(10);
    readonly rotation = input(0);

    constructor() {
        super();
        effect(() => {
            this.mFrame = new Rect(0, 0, this.width(), this.height(), this.rotation());
        });
    }

    protected calcShape(x: number, y: number): IShape {
        const ratio = this.canvas.ratio;
        const width = untracked(() => this.width());
        const height = untracked(() => this.height());
        const rotation = untracked(() => this.rotation());
        return new Rect(x, y, width * ratio, height * ratio, rotation);
    }
}
