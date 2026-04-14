import {Component, Input, OnChanges} from "@angular/core";
import {
    CanvasItemDirection,
    Frame,
    InteractiveCanvas,
    InteractiveCanvasArea,
    InteractiveCanvasItem,
    InteractiveCanvasParams,
    IPoint,
    IShape
} from "../../common-types";
import {MaybePromise} from "../../helper-types";
import {eqPts, Point, Rect} from "../../utils/geometry";
import {clamp, isEqual, overflow} from "../../utils/math.utils";

@Component({
    standalone: false,
    selector: "__interactive-item__",
    template: ""
})
export class InteractiveItemComponent implements OnChanges, InteractiveCanvasItem {

    protected pos: Point;
    protected rot: number;
    protected mFrame: Rect;
    protected mShapes: IShape[];

    get id(): string {
        return null;
    }

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

    get rotation() {
        return this.rot;
    }

    @Input()
    set rotation(value: number) {
        if (isNaN(value)) return;
        this.rot = value;
        this.validRotation = this.rot;
    }

    get isValid(): boolean {
        return eqPts(this.pos, this.validPos) && isEqual(this.rot, this.validRot);
    }

    get validPosition(): IPoint {
        return this.validPos;
    }

    set validPosition(value: IPoint) {
        if (typeof value !== "object" || isNaN(value.x) || isNaN(value.y) || value === this.validPos) return;
        this.validPos = new Point(value.x, value.y);
    }

    get validRotation(): number {
        return this.validRot;
    }

    set validRotation(value: number) {
        if (isNaN(value)) return;
        this.validRot = value;
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
    canvasParams: InteractiveCanvasParams;

    protected validPos: Point;
    protected validRot: number;
    protected otherAreas: InteractiveCanvasArea[];

    constructor() {
        this.active = false;
        this.index = -1;
        this.canvasParams = {};
        this.pos = Point.Zero;
        this.validPos = Point.Zero;
        this.rot = 0;
        this.validRot = 0;
        this.direction = "none";
        this.mFrame = new Rect(0, 0, 3, 3);
        this.mShapes = [];
    }

    draw(ctx: CanvasRenderingContext2D, shape: IShape): MaybePromise<void> {
        const path = shape.getPath(0, 0, 1);
        ctx.fill(path);
        ctx.stroke(path);

        if (!this.isValid) {
            ctx.fillStyle = `rgba(232, 28, 28, 0.55)`;
            ctx.fill(path);
        }
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

    moveTo(x: number, y: number): void {
        if (!this.canvas || this.direction === "none") return;
        const target = this.restrictPosition(
            this.direction === "vertical" ? this.pos.x : x,
            this.direction === "horizontal" ? this.pos.y : y
        );
        this.pos = new Point(target);
        this.makeDistances();
        this.calcShapes();
        this.validPos = this.checkIsValid() ? this.pos : this.validPos;
    }

    moveEnd(): void {
        this.clearDistances();
        if (this.isValid) return;
        this.pos = this.validPos;
        this.calcShapes();
    }

    rotateTo(value: number): void {
        this.rot = isNaN(value) ? this.rot : value;
        this.makeDistances();
        this.calcShapes();
        this.validRot = this.checkIsValid() ? this.rot : this.validRot;
    }

    rotateEnd(): void {
        this.clearDistances();
        if (this.isValid) return;
        this.rot = this.validRot;
        this.calcShapes();
    }

    protected makeDistances(): void {
        if (!this.canvas || this.otherAreas) return;
        this.otherAreas = [
            ...(this.canvas.excludedAreas || []),
            ...(this.canvas.items || []).filter(item => item !== this),
        ];
        this.otherAreas.forEach(area => {
            area.distance = this.distToPixels(this.getMinDistance(area));
        });
    }

    protected clearDistances(): void {
        if (!this.otherAreas) return;
        this.otherAreas.forEach(area => area.distance = null);
        this.otherAreas = null;
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
            this.otherAreas.every(other => this.isValidByDistance(other));
    }

    protected isValidByParams(): boolean {
        return true;
    }

    protected isValidByDistance(other: InteractiveCanvasArea): boolean {
        return !this.shapes.some(shape => {
            return other.shapes.some(os => {
                return shape.distance(os) <= other.distance;
            });
        });
    }

    protected distToPixels(value: number): number {
        return !this.canvas ? 1 : (isNaN(value) || value < 0 ? 0 : value) * (this.canvas.ratio ?? 1);
    }

    protected getMinDistance(other: InteractiveCanvasArea): number {
        return !other ? 0 : 10;
    }

    protected calcShape(x: number, y: number): IShape {
        return new Point(x, y);
    }
}
