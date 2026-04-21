import {IPoint, IShape, ShapeIntersection} from "../../common-types";
import {gjkIntersection} from "./gjk";
import {
    addPts,
    distance,
    dotProduct,
    ensurePoint,
    isPoint,
    lengthOfPt,
    multiplyPts,
    perpendicular,
    rotateDeg,
    subPts
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

    abstract getPath(x: number, y: number, ratio?: number): Path2D;

    abstract support(dir: IPoint): IPoint;

    abstract offset(value: number): IShape;

    abstract move(pos: IPoint): IShape;

    intersection(shape: IShape, logs: boolean): ShapeIntersection {
        return gjkIntersection(this, shape, logs);
    }

    intersects(shape: IShape, logs: boolean): boolean {
        return this.intersection(shape, logs).hit;
    }

    distance(shape: IShape): number {
        return distance(this.center, shape.center);
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

    getPath(x: number, y: number): Path2D {
        const path = new Path2D();
        path.ellipse(x, y, 1.5, 1.5, 0, 0, Math.PI * 2);
        return path;
    }

    support(): IPoint {
        return this.center;
    }

    offset(): IShape {
        return this;
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
                readonly rotation: number = 0,
                readonly radius: number = 0) {
        super(x, y);
    }

    getPath(x: number, y: number, ratio?: number): Path2D {
        ratio = ratio ?? 1;
        const w = this.width * ratio;
        const h = this.height * ratio;
        const r = this.radius * ratio;

        // 1. Create the local path for the rectangle (centered at 0,0)
        const rectPath = new Path2D();
        rectPath.roundRect(-w / 2, -h / 2, w, h, r);

        // 2. Create a DOMMatrix to handle the rotation
        const matrix = new DOMMatrix()
            .translate(x, y) // Move to position
            .rotate(this.rotation); // Apply rotation (in degrees)

        // 3. Create the final path and apply the matrix
        const finalPath = new Path2D();
        finalPath.addPath(rectPath, matrix);

        return finalPath;
    }

    support(dir: IPoint): IPoint {
        const ang = this.rotation ?? 0;

        // 1. Move search direction into local space
        const dLocal = rotateDeg(ensurePoint(dir, {x: 1, y: 0}), -ang);

        // 2. Use the SHARP dimensions for the base calculation
        // We subtract the radius here because the 'roundRect' expansion
        // happens outward from the inner core.
        const hw = Math.max(0, this.width / 2 - this.radius);
        const hh = Math.max(0, this.height / 2 - this.radius);

        // 3. Find the local corner of that inner core
        const lx = dLocal.x >= 0 ? hw : -hw;
        const ly = dLocal.y >= 0 ? hh : -hh;

        // 4. Rotate that core corner back to world space
        const corePoint = addPts(rotateDeg({x: lx, y: ly}, ang), this.pt);

        // 5. Add the "Radial Expansion"
        // This turns the sharp corner into a circular arc for GJK
        const mag = Math.hypot(dir.x, dir.y);
        if (mag < 1e-9 || this.radius <= 0) return corePoint;

        return {
            x: corePoint.x + (dir.x / mag) * this.radius,
            y: corePoint.y + (dir.y / mag) * this.radius
        };
    }

    offset(value: number): Rect {
        value = value ?? 0;
        return new Rect(this.x, this.y, this.width + value * 2, this.height + value * 2, this.rotation, this.radius + value);
    }

    move(pos: IPoint): Rect {
        return new Rect(pos.x, pos.y, this.width, this.height, this.rotation, this.radius);
    }
}

export class Oval extends Shape {

    constructor(x: number, y: number,
                readonly width: number,
                readonly height: number,
                readonly rotation: number = 0) {
        super(x, y);
    }

    getPath(x: number, y: number, ratio: number = 1): Path2D {
        // 1. Calculate radii based on ratio
        const radiusX = (this.width * ratio) / 2;
        const radiusY = (this.height * ratio) / 2;

        // 2. Create the local ellipse at (0,0)
        const ovalPath = new Path2D();
        // Parameters: x, y, radiusX, radiusY, rotation, startAngle, endAngle
        ovalPath.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        ovalPath.closePath();

        // 3. Create the transformation matrix
        // Note: We use the passed in x and y here
        const matrix = new DOMMatrix()
            .translate(x, y)
            .rotate(this.rotation);

        // 4. Combine them
        const path = new Path2D();
        path.addPath(ovalPath, matrix);

        return path;
    }

    support(dir: IPoint) {
        const ang = this.rotation ?? 0;
        // 1. Move search direction into local, non-rotated space
        const dLocal = rotateDeg(ensurePoint(dir, { x: 1, y: 0 }), -ang);

        const hw = this.width / 2;
        const hh = this.height / 2;

        // 2. High-precision ellipse support formula
        // This finds the EXACT point on the curved boundary
        const q = Math.hypot(hw * dLocal.x, hh * dLocal.y) || 1;
        const lx = (hw * hw * dLocal.x) / q;
        const ly = (hh * hh * dLocal.y) / q;

        // 3. Rotate back and add this shape's position
        return addPts(rotateDeg({ x: lx, y: ly }, ang), this.pt);
    }

    offset(value: number): Oval {
        value = value ?? 0;
        return new Oval(this.x, this.y, this.width + value * 2, this.height + value * 2, this.rotation);
    }

    move(pos: IPoint): Oval {
        return new Oval(pos.x, pos.y, this.width, this.height, this.rotation);
    }
}

export class Circle extends Oval {
    constructor(x: number, y: number, readonly radius: number, rotation: number = 0) {
        super(x, y, radius * 2, radius * 2, rotation);
    }

    offset(value: number): Circle {
        value = value ?? 0;
        return new Circle(this.x, this.y, this.radius + value, this.rotation);
    }

    move(pos: IPoint): Circle {
        return new Circle(pos.x, pos.y, this.radius, this.rotation);
    }
}

export class ShapeGroup extends Shape {

    constructor(x: number, y: number, protected readonly subShapes: ReadonlyArray<IShape>) {
        super(x, y);
    }

    getPath(x: number, y: number, ratio: number = 1): Path2D {
        const groupPath = new Path2D();

        for (const shape of this.subShapes) {
            // Calculate child's position relative to the Group's (x, y)
            const childPath = shape.getPath(x + shape.x, y + shape.y, ratio);

            // Add it to our master group path
            groupPath.addPath(childPath);
        }

        return groupPath;
    }

    support(dir: IPoint): IPoint {
        let bestPoint: IPoint | null = null;
        let maxDot = -Infinity;

        for (const shape of this.subShapes) {
            // 1. Get child's support (Relative to this Group's origin)
            const p = shape.support(dir);

            // 2. Move that point into the space ABOVE this group
            const worldPoint = addPts(p, this.pt);

            // 3. We must compare dot products in a consistent space
            const d = worldPoint.x * dir.x + worldPoint.y * dir.y;

            if (d > maxDot) {
                maxDot = d;
                bestPoint = worldPoint;
            }
        }

        return bestPoint ?? this.pt;
    }

    offset(value: number): IShape {
        value = value ?? 0;
        return new ShapeGroup(this.x, this.y, this.subShapes.map(s => s.offset(value)));
    }

    move(pos: IPoint): IShape {
        return new ShapeGroup(pos.x, pos.y, this.subShapes);
    }
}
