import {Invokable} from "invokable";
import {InteractiveCanvas, InteractiveCanvasRenderer} from "../../common-types";

export class ExclusionsRenderer {

    constructor() {
        return Invokable.create(this);
    }

    async [Invokable.call](renderCanvas: InteractiveCanvas): Promise<void> {
        const ctx = renderCanvas.ctx;
        renderCanvas.excludedAreas?.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.fillStyle = "rgba(128,128,128,0.55)";
            shape.draw(ctx);
            ctx.fill();
            ctx.restore();
        })
    }
}

export interface ExclusionsRenderer extends InteractiveCanvasRenderer {
}
