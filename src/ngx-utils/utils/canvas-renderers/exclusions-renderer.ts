import {Invokable} from "invokable";
import {InteractiveCanvas, InteractiveCanvasRenderer} from "../../common-types";

export class ExclusionsRenderer {

    constructor() {
        return Invokable.create(this);
    }

    async [Invokable.call](renderCanvas: InteractiveCanvas): Promise<void> {
        const ctx = renderCanvas.ctx;
        renderCanvas.excludedAreas?.forEach(area => {
            ctx.fillStyle = "rgba(128,128,128,0.55)";
            area.shapes.forEach(shape => {
                const path = shape.getPath(shape.x, shape.y, 1);
                ctx.fill(path);
            });
        })
    }
}

export interface ExclusionsRenderer extends InteractiveCanvasRenderer {
}
