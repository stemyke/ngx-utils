import {IShape} from "../common-types";

export class Rect implements IShape {

    get center(): Point {
        return new Point(this.x, this.y);
    }

    get left(): number {
        return this.x - this.width * .5;
    }

    get right(): number {
        return this.x + this.width * .5;
    }

    get bottom(): number {
        return this.y - this.height * .5;
    }

    get top(): number {
        return this.y + this.height * .5;
    }

    constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number, readonly rotation: number = 0) {

    }

    distance(p: Point): number {
        p = p.rotateAround(this.center, -this.rotation);
        const x = Math.max(this.left - p.x, 0, p.x - this.right);
        const y = Math.max(this.bottom - p.y, 0, p.y - this.top);
        return Math.sqrt(x*x + y*y);
    }
}

export class Circle implements IShape {

    get center(): Point {
        return new Point(this.x, this.y);
    }

    get left(): Point {
        return new Point(this.x - this.radius, this.y);
    }

    get right(): Point {
        return new Point(this.x + this.radius, this.y);
    }

    get top(): Point {
        return new Point(this.x, this.y + this.radius);
    }

    get bottom(): Point {
        return new Point(this.x, this.y - this.radius);
    }

    get rect(): Rect {
        return new Rect(this.x, this.y, this.radius * 2, this.radius * 2);
    }

    constructor(readonly x: number, readonly y: number, readonly radius: number) {

    }

    distance(p: Point): number {
        return this.center.distance(p) - this.radius;
    }
}

export class Point implements IShape {

    static Zero: Point = new Point(0, 0);

    get length(): number {
        return this.distance(Point.Zero);
    }

    get perpendicular(): Point {
        return new Point(this.y, -this.x);
    }

    constructor(readonly x: number, readonly y: number) {
    }

    add(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    subtract(p: Point): Point {
        return new Point(this.x - p.x, this.y - p.y);
    }

    multiply(p: Point | number): Point {
        if (p instanceof Point) {
            return new Point(this.x * p.x, this.y * p.y);
        }
        return new Point(this.x * p, this.y * p);
    }

    distance(b: Point): number {
        const x = b.x - this.x;
        const y = b.y - this.y;
        return Math.sqrt(x * x + y * y);
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
        const pd = c.center.subtract(this);
        const a = Math.asin(c.radius / pd.length);
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
