import {Invokable} from "invokable";
import {InteractiveCanvas, InteractiveCanvasRenderer} from "../../common-types";
import {createStripePattern} from "../canvas";

export class HitZoneRenderer {

    protected pattern: CanvasPattern;

    constructor() {
        return Invokable.create(this);
    }

    async [Invokable.call](renderCanvas: InteractiveCanvas): Promise<void> {
        const ctx = renderCanvas.ctx;
        const hitShapes = renderCanvas.selectedItem?.hitShapes;
        this.pattern = this.pattern || createStripePattern(20, "#efefef", "#6c6c6c");
        if (!hitShapes) return;
        ctx.globalAlpha = 0.5;
        await renderCanvas.tempPaint(temp => {
            temp.lineWidth = 1;
            temp.fillStyle = this.pattern;
            hitShapes.forEach(shape => {
                const path = shape.getPath(shape.x, shape.y, 1);
                temp.fill(path);
            });
            temp.fillStyle = "#404040";
            temp.strokeStyle = "#090909";
            renderCanvas.selectedItem.shapes.forEach(shape => {
                const path = shape.getPath(shape.x, shape.y, 1);
                temp.fill(path);
                temp.stroke(path);
            });
            return null;
        });
        ctx.globalAlpha = 1;
    }
}

export interface HitZoneRenderer extends InteractiveCanvasRenderer {
}
