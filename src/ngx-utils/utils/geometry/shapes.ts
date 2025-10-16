import {IPoint, IShape, ShapeDistance, ShapeIntersection} from "../../common-types";
import {gjkDistance, gjkIntersection} from "./gjk";
import {
    addPts,
    dotProduct,
    ensurePoint,
    isPoint,
    lengthOfPt,
    multiplyPts,
    perpendicular,
    rotateDeg,
    subPts,
    toRadians
} from "./functions";

abstract class Shape implements IShape {

    get center(): IPoint {
        return this.pt;
    }

    get x(): number {
        return this.center.x;
    }

    get y(): number {
        return this.center.y;
    }

    protected pt: IPoint;

    protected constructor(x: number, y: number) {
        this.pt = {x, y};
    }

    abstract draw(ctx: CanvasRenderingContext2D, ratio?: number): void;

    abstract support(dir: IPoint): IPoint;

    abstract move(pos: IPoint): IShape;

    intersection(shape: IShape): ShapeIntersection {
        return gjkIntersection(this, shape);
    }

    intersects(shape: IShape): boolean {
        return this.intersection(shape).hit;
    }

    minDistance(shape: IShape): ShapeDistance {
        return gjkDistance(this, shape);
    }

    distance(shape: IShape): number {
        return this.minDistance(shape).distance;
    }
}

export class Point extends Shape {

    static Zero: Point = new Point(0, 0);

    get length(): number {
        return lengthOfPt(this);
    }

    get perpendicular(): Point {
        return new Point(perpendicular(this));
    }

    constructor(xOrP: number | IPoint, y: number = 0) {
        super(0, y);
        const x = Number(xOrP);
        this.pt = isPoint(xOrP) ? xOrP : {x: isNaN(x) ? 0 : xOrP as number, y};
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, 1.5, 0, 0, Math.PI * 2);
        ctx.closePath();
    }

    support(): IPoint {
        return this.center;
    }

    move(pos: IPoint): IShape {
        return new Point(pos);
    }

    add(p: IPoint): Point {
        return new Point(addPts(this, p));
    }

    subtract(p: IPoint): Point {
        return new Point(subPts(this, p));
    }

    multiply(p: IPoint | number): Point {
        return new Point(multiplyPts(this, p));
    }

    divide(p: IPoint | number): Point {
        return new Point(multiplyPts(this, p));
    }

    dot(p: IPoint): Point {
        return new Point(dotProduct(this, p));
    }

    lerp(p: Point, ratio: number): Point {
        const diff = p.subtract(this);
        return this.add(diff.multiply(ratio));
    }

    perpendicularTo(p: Point, length: number): Point {
        const diff = p.perpendicular.subtract(this.perpendicular);
        const ratio = length / diff.length;
        const center = this.lerp(p, .5);
        return center.add(diff.multiply(ratio));
    }

    circleWith(a: Point, b: Point): Circle {
        const yDelta_a = b.y - a.y;
        const xDelta_a = b.x - a.x;
        const yDelta_b = this.y - b.y;
        const xDelta_b = this.x - b.x;

        const aSlope = yDelta_a / xDelta_a;
        const bSlope = yDelta_b / xDelta_b;

        const x = (aSlope * bSlope * (a.y - this.y) + bSlope * (a.x + b.x) - aSlope * (b.x + this.x)) / (2 * (bSlope - aSlope));
        const y = -1 * (x - (a.x + b.x) / 2) / aSlope + (a.y + b.y) / 2;
        const center = new Point(x, y);
        return new Circle(center.x, center.y, center.distance(this));
    }

    tangents(c: Circle): Point[] {
        const pd = subPts(c.center, this);
        const a = Math.asin(c.radius / lengthOfPt(pd));
        const b = Math.atan2(pd.y, pd.x);
        // Tangent points
        let t = b - a;
        const t1 = new Point(c.x + c.radius * Math.sin(t), c.y + c.radius * -Math.cos(t));
        t = b + a;
        const t2 = new Point(c.x + c.radius * -Math.sin(t), c.y + c.radius * Math.cos(t));
        return [t1, t2];
    }

    angle(p: Point): number {
        const diff = p.subtract(this);
        return Math.atan2(diff.y, diff.x) * 180 / Math.PI;
    }

    rotateAround(p: Point, angle: number): Point {
        const rotation = (p.angle(this) + angle) * Math.PI / 180;
        const distance = p.distance(this);
        const rotated = new Point(Math.cos(rotation) * distance, Math.sin(rotation) * distance);
        return p.add(rotated);
    }
}

export class Rect extends Shape {

    constructor(x: number, y: number,
                readonly width: number,
                readonly height: number,
                readonly rotation: number = 0) {
        super(x, y);
    }

    draw(ctx: CanvasRenderingContext2D, ratio: number): void {
        ratio = ratio ?? 1;
        const w = this.width * ratio;
        const h = this.height * ratio;
        const angle = toRadians(this.rotation);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.rect(-w / 2, -h / 2, w, h);
        ctx.closePath();
        ctx.rotate(-angle);
    }

    support(dir: IPoint) {
        const ang = this.rotation ?? 0;
        const dLocal = rotateDeg(ensurePoint(dir, {x: 1, y: 0}), -ang);
        const hw = Math.max(0, this.width / 2),
            hh = Math.max(0, this.height / 2);
        if (hw === 0 && hh === 0) return ensurePoint(this.center);
        const lx = dLocal.x >= 0 ? hw : -hw;
        const ly = dLocal.y >= 0 ? hh : -hh;
        return addPts(rotateDeg({x: lx, y: ly}, ang), this.center);
    }

    move(pos: IPoint): Rect {
        return new Rect(pos.x, pos.y, this.width, this.height, this.rotation);
    }
}

export class Oval extends Shape {

    constructor(x: number, y: number,
                readonly width: number,
                readonly height: number,
                readonly rotation: number = 0) {
        super(x, y);
    }

    draw(ctx: CanvasRenderingContext2D, ratio: number): void {
        ratio = ratio ?? 1;
        const w = this.width * ratio;
        const h = this.height * ratio;
        const angle = toRadians(this.rotation);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.rotate(-angle);
    }

    support(dir: IPoint) {
        const ang = this.rotation ?? 0;
        const d = rotateDeg(ensurePoint(dir, {x: 1, y: 0}), -ang);
        const a = Math.max(0, this.width / 2),
            b = Math.max(0, this.height / 2);
        if (a === 0 && b === 0) return ensurePoint(this.center);
        const q = Math.hypot(a * d.x, b * d.y) || 1;
        const lx = (a * a * d.x) / q, ly = (b * b * d.y) / q;
        return addPts(rotateDeg({x: lx, y: ly}, ang), this.center);
    }

    move(pos: IPoint): Oval {
        return new Oval(pos.x, pos.y, this.width, this.height, this.rotation);
    }
}

export class Circle extends Oval {
    constructor(x: number, y: number, readonly radius: number, rotation: number = 0) {
        super(x, y, radius * 2, radius * 2, rotation);
    }

    move(pos: IPoint): Circle {
        return new Circle(pos.x, pos.y, this.radius, this.rotation);
    }
}
