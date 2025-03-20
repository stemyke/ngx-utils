import {Component, Input} from "@angular/core";
import {CanvasItemShape, InteractiveCanvas, IShape} from "../../common-types";
import {Rect} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";
import {InteractiveCanvasComponent} from "./interactive-canvas.component";

@Component({
    standalone: false,
    selector: "interactive-rect",
    template: "",
    providers: [
        {provide: InteractiveItemComponent, useExisting: InteractiveRectComponent},
    ]
})
export class InteractiveRectComponent extends InteractiveItemComponent {

    @Input() width: number;
    @Input() height: number;

    get canvas(): InteractiveCanvas {
        return this.iCanvas;
    }

    get shape(): CanvasItemShape {
        return "rect";
    }

    constructor(protected iCanvas: InteractiveCanvasComponent) {
        super();
    }

    calcShape(x: number, y: number): IShape {
        const ratio = this.canvas.ratio;
        return new Rect(x, y, this.width * ratio, this.height * ratio, this.rotation)
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
        scale *= this.canvas.ratio;
        const width = this.width * scale;
        const height = this.height * scale;
        this.shapes.forEach(shape => {
            ctx.beginPath();
            ctx.rect(shape.x - width / 2, shape.y - height / 2, width, height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }
}
