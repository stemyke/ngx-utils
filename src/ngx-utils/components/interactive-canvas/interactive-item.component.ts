import {Component, Input, OnChanges} from "@angular/core";
import {CanvasItemDirection, InteractiveCanvas, InteractiveCanvasItem, IPoint, IShape} from "../../common-types";
import {Point} from "../../utils/geometry";
import {MaybePromise} from "../../helper-types";
import {drawOval} from "../../utils/canvas";

@Component({
    standalone: false,
    selector: "__interactive-item__",
    template: ""
})
export class InteractiveItemComponent implements OnChanges, InteractiveCanvasItem {

    protected pos: Point;
    protected mShapes: IShape[];

    get shapes(): ReadonlyArray<IShape> {
        return this.mShapes;
    }

    get hovered(): boolean {
        return this.canvas?.hoveredItem === this;
    }

    set hovered(value: boolean) {
        if (!this.canvas) return;
        this.canvas.hoveredItem = value ? this : null;
    }

    get x(): number {
        return this.pos.x;
    }

    @Input()
    set x(value: number) {
        if (isNaN(value) || value === this.pos.x) return;
        this.pos = new Point(value, this.pos.y);
        this.validPosition = this.pos;
    }

    get y(): number {
        return this.pos.y;
    }

    @Input()
    set y(value: number) {
        if (isNaN(value) || value === this.pos.y) return;
        this.pos = new Point(this.pos.x, value);
        this.validPosition = this.pos;
    }

    get position() {
        return this.pos;
    }

    @Input()
    set position(value: IPoint) {
        if (typeof value !== "object" || isNaN(value.x) || isNaN(value.y) || value === this.pos) return;
        this.pos = new Point(value.x, value.y);
        this.validPosition = this.pos;
    }

    get isValid(): boolean {
        return this.valid;
    }

    get validPosition(): IPoint {
        return this.validPos;
    }

    set validPosition(value: IPoint) {
        if (typeof value !== "object" || isNaN(value.x) || isNaN(value.y) || value === this.validPos) return;
        this.validPos = new Point(value.x, value.y);
        this.valid = true;
    }

    @Input() direction: CanvasItemDirection;
    @Input() disabled: boolean;

    canvas: InteractiveCanvas;
    index: number;
    active: boolean;

    protected valid: boolean;
    protected validPos: Point;

    constructor() {
        this.active = false;
        this.index = -1;
        this.valid = true;
        this.pos = Point.Zero;
        this.direction = "none";
        this.mShapes = [];
    }

    draw(ctx: CanvasRenderingContext2D): MaybePromise<void> {
        drawOval(ctx, 4, 4);
        ctx.fill();
        ctx.stroke();
    }

    ngOnChanges(): void {
        if (!this.canvas) return;
        this.calcShapes();
    }

    calcShapes(): void {
        const ratio = this.canvas.ratio ?? 1;
        const x = this.pos.x * ratio;
        const y = this.pos.y * ratio;
        this.mShapes = this.canvas.cycles.map(pan => this.calcShape(x, y + pan));
    }

    hit(point: Point): boolean {
        for (const shape of this.shapes) {
            if (shape.minDistance(point) <= 0) return true;
        }
        return false;
    }

    moveBy(dx: number, dy: number): void {
        if (this.direction === "none") return;
        switch (this.direction) {
            case "horizontal":
                this.pos = new Point(this.pos.x + dx, this.pos.y);
                break;
            case "vertical":
                this.pos = new Point(this.pos.x, this.pos.y + dy);
                break;
            default:
                this.pos = new Point(this.pos.x + dx, this.pos.y + dy);
                break;
        }
        this.calcShapes();
        this.valid = this.isValidByParams() && this.canvas.items.every(other => this === other || this.isValidByDistance(other));
        this.validPos = this.valid ? this.pos : this.validPos;
    }

    moveEnd(): void {
        if (this.valid) return;
        this.pos = this.validPos;
        this.valid = true;
        this.calcShapes();
    }

    protected isValidByParams(): boolean {
        return true;
    }

    protected isValidByDistance(other: InteractiveCanvasItem): boolean {
        const minPixels = this.distToPixels(this.getMinDistance(other));
        return !this.shapes.some(shape => {
            return other.shapes.some(os => {
                return os.minDistance(shape) <= minPixels;
            });
        });
    }

    protected distToPixels(value: number): number {
        return !this.canvas ? 1 : Math.max(1, (isNaN(value) || value < 0 ? 0 : value) * (this.canvas.ratio ?? 1));
    }

    protected getMinDistance(other: InteractiveCanvasItem): number {
        return !other ? 0 : null;
    }

    protected calcShape(x: number, y: number): IShape {
        return new Point(x, y);
    }
}
