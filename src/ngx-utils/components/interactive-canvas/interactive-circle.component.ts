import {Component, Input} from "@angular/core";

import {IShape} from "../../common-types";
import {Circle} from "../../utils/geometry";
import {drawOval} from "../../utils/canvas";
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

    @Input() radius: number;

    constructor() {
        super();
        this.radius = 10;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const diameter = this.radius * 2 * this.canvas.ratio;
        drawOval(ctx, diameter, diameter);
        ctx.fill();
        ctx.stroke();
    }

    protected calcShape(x: number, y: number): IShape {
        const ratio = this.canvas.ratio;
        return new Circle(x, y, this.radius * ratio);
    }
}
