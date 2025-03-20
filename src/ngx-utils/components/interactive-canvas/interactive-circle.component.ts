import {Component, Input} from "@angular/core";
import {CanvasItemShape, InteractiveCanvas, IShape} from "../../common-types";
import {Circle} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";
import {InteractiveCanvasComponent} from "./interactive-canvas.component";

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

    get canvas(): InteractiveCanvas {
        return this.iCanvas;
    }

    get shape(): CanvasItemShape {
        return "circle";
    }

    constructor(protected iCanvas: InteractiveCanvasComponent) {
        super();
    }

    calcShape(x: number, y: number): IShape {
        const ratio = this.canvas.ratio;
        return new Circle(x, y, this.radius * ratio);
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
        const radius = this.radius * this.canvas.ratio * scale;
        this.shapes.forEach(shape => {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }
}
