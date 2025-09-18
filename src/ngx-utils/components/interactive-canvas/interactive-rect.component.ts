import {Component, Input} from "@angular/core";
import {IShape} from "../../common-types";
import {Rect, toRadians} from "../../utils/geometry";
import {drawRect} from "../../utils/canvas";
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

    @Input() width: number;
    @Input() height: number;
    @Input() rotation: number;

    constructor() {
        super();
        this.width = 10;
        this.height = 10;
        this.rotation = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const ratio = this.canvas.ratio;
        ctx.rotate(toRadians(this.rotation));
        drawRect(ctx, this.width * ratio, this.height * ratio);
        ctx.fill();
        ctx.stroke();
    }

    protected calcShape(x: number, y: number): IShape {
        const ratio = this.canvas.ratio;
        return new Rect(x, y, this.width * ratio, this.height * ratio, this.rotation)
    }
}
