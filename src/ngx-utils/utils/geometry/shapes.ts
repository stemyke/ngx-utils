import {IPoint, IShape} from "../../common-types";
import {gjkDistance} from "./distance";
import {
    dotProduct,
    isPoint,
    perpendicular,
    ptAdd,
    ptDistance,
    ptLength,
    ptMultiply,
    ptSubtract,
    rotateDeg
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

    abstract support(dir: IPoint): IPoint;

    distance(p: IPoint): number {
        return ptDistance(this.center, p);
    }

    minDistance(shape: IShape): number {
        return gjkDistance(this, shape).distance;
    }
}

export class Point extends Shape {

    static Zero: Point = new Point(0, 0);

    get length(): number {
        return ptLength(this);
    }

    get perpendicular(): Point {
        return new Point(perpendicular(this));
    }

    constructor(xOrP: number | IPoint, y: number = 0) {
        super(0, y);
        const x = Number(xOrP);
        this.pt = isPoint(xOrP) ? xOrP : {x: isNaN(x) ? 0 : xOrP as number, y};
    }

    support(): IPoint {
        return this.pt;
    }

    add(p: Point): Point {
        return new Point(ptAdd(this, p));
    }

    sub(p: Point): Point {
        return new Point(ptSubtract(this, p));
    }

    mul(p: Point | number): Point {
        return new Point(ptMultiply(this, p));
    }

    dot(p: Point): Point {
        return new Point(dotProduct(this, p));
    }

    distance(p: IPoint): number {
        return ptDistance(this, p);
    }

    lerp(p: Point, ratio: number): Point {
        const diff = p.sub(this);
        return this.add(diff.mul(ratio));
    }

    perpendicularTo(p: Point, length: number): Point {
        const diff = p.perpendicular.sub(this.perpendicular);
        const ratio = length / diff.length;
        const center = this.lerp(p, .5);
        return center.add(diff.mul(ratio));
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
        const pd = ptSubtract(c.center, this);
        const a = Math.asin(c.radius / ptLength(pd));
        const b = Math.atan2(pd.y, pd.x);
        // Tangent points
        let t = b - a;
        const t1 = new Point(c.x + c.radius * Math.sin(t), c.y + c.radius * -Math.cos(t));
        t = b + a;
        const t2 = new Point(c.x + c.radius * -Math.sin(t), c.y + c.radius * Math.cos(t));
        return [t1, t2];
    }

    angle(p: Point): number {
        const diff = p.sub(this);
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

    support(dir: IPoint) {
        const ang = this.rotation ?? 0;
        const dLocal = rotateDeg(dir, -ang);
        const hw = Math.max(0, this.width / 2), hh = Math.max(0, this.height / 2);
        const lx = dLocal.x >= 0 ? hw : -hw;
        const ly = dLocal.y >= 0 ? hh : -hh;
        return ptAdd(rotateDeg({x: lx, y: ly}, ang), {x: this.x, y: this.y});
    }
}

export class Oval extends Shape {

    constructor(x: number, y: number,
                readonly width: number,
                readonly height: number,
                readonly rotation: number = 0) {
        super(x, y);
    }

    support(dir: IPoint) {
        const ang = this.rotation ?? 0;
        const d = rotateDeg(dir, -ang);
        const a = Math.max(0, this.width / 2);
        const b = Math.max(0, this.height / 2);
        if (Math.abs(d.x) < 1e-12 && Math.abs(d.y) < 1e-12)
            return {x: this.x, y: this.y};
        const q = Math.hypot(a * d.x, b * d.y) || 1; // sqrt((a*dx)^2 + (b*dy)^2)
        const lx = (a * a * d.x) / q;
        const ly = (b * b * d.y) / q;
        return ptAdd(rotateDeg({x: lx, y: ly}, ang), {x: this.x, y: this.y});
    }
}

export class Circle extends Oval {
    constructor(x: number, y: number, readonly radius: number, rotation: number = 0) {
        super(x, y, radius * 2, radius * 2, rotation);
    }
}
