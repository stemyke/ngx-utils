import {Invokable} from "invokable";
import {InteractiveCanvas, InteractiveCanvasRenderer} from "../../common-types";

const rulerDash: number[] = [5, 5];
const emptyDash: number[] = [];

export class RulerCanvasRenderer {

    constructor() {
        return Invokable.create(this);
    }

    async [Invokable.call](renderCanvas: InteractiveCanvas): Promise<void> {
        const ctx = renderCanvas.ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(128, 128, 128, 0.4)";
        ctx.setLineDash(rulerDash);
        renderCanvas.cycles?.forEach(cycle => {
            ctx.beginPath();
            ctx.moveTo(0, cycle);
            ctx.lineTo(renderCanvas.canvasWidth, cycle);
            ctx.stroke();
        });
        const hw = renderCanvas.canvasWidth / 2;
        ctx.lineDashOffset = -renderCanvas.basePan;
        ctx.beginPath();
        ctx.moveTo(hw, 0);
        ctx.lineTo(hw, renderCanvas.canvasHeight);
        ctx.stroke();
        ctx.setLineDash(emptyDash);
    }
}

export interface RulerCanvasRenderer extends InteractiveCanvasRenderer {
}
