export class Vector {

    get negative(): Vector {
        return new Vector(-this.x, -this.y, -this.z);
    }

    get length(): number {
        return Math.sqrt(this.dot(this));
    }

    get unit(): Vector {
        return this.divide(this.length);
    }

    get min(): number {
        return Math.min(Math.min(this.x, this.y), this.z);
    }

    get max(): number {
        return Math.max(Math.max(this.x, this.y), this.z);
    }

    get angles(): any {
        return {
            theta: Math.atan2(this.z, this.x),
            phi: Math.asin(this.y / this.length)
        };
    }

    constructor(public x: number, public y: number, public z: number) {
    }

    add(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
        else return new Vector(this.x + v, this.y + v, this.z + v);
    }

    subtract(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
        else return new Vector(this.x - v, this.y - v, this.z - v);
    }

    multiply(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
        else return new Vector(this.x * v, this.y * v, this.z * v);
    }

    divide(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        else return new Vector(this.x / v, this.y / v, this.z / v);
    }

    equals(v: Vector): boolean {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector): Vector {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    angleTo(v: Vector): number {
        return Math.acos(this.dot(v) / (this.length * v.length));
    }

    toArray(n?: number): number[] {
        return [this.x, this.y, this.z].slice(0, n || 3);
    }

    clone(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    init(x: number, y: number, z: number): Vector {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
}
