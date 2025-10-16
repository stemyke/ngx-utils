import {Component, Input, OnChanges} from "@angular/core";
import {
    CanvasItemDirection,
    InteractiveCanvas,
    InteractiveCanvasItem,
    IPoint,
    IShape,
    Frame
} from "../../common-types";
import {Point, Rect} from "../../utils/geometry";
import {MaybePromise} from "../../helper-types";
import {clamp, overflow} from "../../utils/math.utils";

@Component({
    standalone: false,
    selector: "__interactive-item__",
    template: ""
})
export class InteractiveItemComponent implements OnChanges, InteractiveCanvasItem {

    protected pos: Point;
    protected mFrame: Rect;
    protected mShapes: IShape[];

    get frame(): Frame {
        return this.mFrame;
    }

    get shapes(): ReadonlyArray<IShape> {
        return this.mShapes;
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

    get hovered(): boolean {
        return this.canvas?.hoveredItem === this;
    }

    set hovered(value: boolean) {
        if (!this.canvas) return;
        this.canvas.hoveredItem = value ? this : null;
    }

    get selected(): boolean {
        return this.canvas?.selectedItem === this;
    }

    set selected(value: boolean) {
        if (!this.canvas) return;
        this.canvas.selectedItem = value ? this : null;
    }

    @Input() direction: CanvasItemDirection;
    @Input() disabled: boolean;

    active: boolean;
    canvas: InteractiveCanvas;
    index: number;

    protected valid: boolean;
    protected validPos: Point;

    constructor() {
        this.active = false;
        this.index = -1;
        this.valid = true;
        this.pos = Point.Zero;
        this.direction = "none";
        this.mFrame = new Rect(0, 0, 3, 3);
        this.mShapes = [];
    }

    draw(ctx: CanvasRenderingContext2D, shape: IShape): MaybePromise<void> {
        shape.draw(ctx, 1);
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
            if (shape.intersects(point)) return true;
        }
        return false;
    }

    moveTo(x: number, y: number): void {
        if (!this.canvas || this.direction === "none") return;
        const target = this.restrictPosition(
            this.direction === "vertical" ? this.pos.x : x,
            this.direction === "horizontal" ? this.pos.y : y
        );
        this.pos = new Point(target);
        this.calcShapes();
        this.valid = this.checkIsValid();
        this.validPos = this.valid ? this.pos : this.validPos;
    }

    moveBy(dx: number, dy: number): void {
        const {x, y} = this.pos;
        this.moveTo(x + dx, y + dy);
    }

    moveX(x: number): void {
        this.moveTo(x, this.pos.y);
    }

    moveY(y: number): void {
        this.moveTo(this.pos.x, y);
    }

    moveEnd(): void {
        if (this.valid) return;
        this.pos = this.validPos;
        this.valid = true;
        this.calcShapes();
    }

    protected restrictPosition(x: number, y: number): IPoint {
        return {
            x: clamp(x, this.canvas.xRange),
            y: this.canvas.isInfinite
                ? overflow(y, this.canvas.yRange)
                : clamp(y, this.canvas.yRange)
        }
    }

    protected checkIsValid(): boolean {
        return this.isValidByParams() &&
            this.canvas.items.every(other => this === other || this.isValidByDistance(other));
    }

    protected isValidByParams(): boolean {
        return !this.shapes.some(shape => {
            return this.canvas.excludedAreas.some(ex => {
                return shape.intersects(ex);
            });
        });
    }

    protected isValidByDistance(other: InteractiveCanvasItem): boolean {
        const minPixels = this.distToPixels(this.getMinDistance(other));
        return !this.shapes.some(shape => {
            return other.shapes.some(os => {
                return shape.distance(os) <= minPixels;
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
