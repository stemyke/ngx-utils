import {Component, effect, input, untracked} from "@angular/core";

import {IShape} from "../../common-types";
import {Circle, Rect} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";

@Component({
    standalone: false,
    selector: "interactive-circle",
    template: "",
    providers: [
        {provide: InteractiveItemComponent, useExisting: InteractiveCircleComponent},
    ]
})
export class InteractiveCircleComponent extends InteractiveItemComponent {

    readonly radius = input(10);

    constructor() {
        super();
        effect(() => {
            const radius = this.radius();
            this.mFrame = new Rect(0, 0, radius * 2, radius * 2);
        });
    }

    protected calcShape(x: number, y: number): IShape {
        const radius = untracked(() => this.radius());
        return new Circle(x, y, radius * this.canvas.ratio);
    }
}
