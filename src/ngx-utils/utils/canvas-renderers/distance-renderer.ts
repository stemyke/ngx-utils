import {Invokable} from "invokable";
import {InteractiveCanvas, InteractiveCanvasRenderer} from "../../common-types";

export class DistanceRenderer {

    constructor() {
        return Invokable.create(this);
    }

    async [Invokable.call](renderCanvas: InteractiveCanvas): Promise<void> {
        const ctx = renderCanvas.ctx;
        ctx.lineWidth = 1;
        ctx.fillStyle = "#bc4949";
        ctx.strokeStyle = "#bc4949";
        ctx.lineJoin = "round";
        renderCanvas.excludedAreas?.forEach(area => {
            if (!area.distance) return;
            ctx.lineWidth = area.distance * 2;
            area.shapes.forEach(shape => {
                const path = shape.getPath(shape.x, shape.y, 1);
                ctx.fill(path);
                ctx.stroke(path);
            });
        });
        renderCanvas.items?.forEach(item => {
            if (!item.distance) return;
            ctx.lineWidth = item.distance * 2;
            item.shapes.forEach(shape => {
                const path = shape.getPath(shape.x, shape.y, 1);
                ctx.fill(path);
                ctx.stroke(path);
            });
        });
        ctx.lineWidth = 1;
    }
}

export interface DistanceRenderer extends InteractiveCanvasRenderer {
}
