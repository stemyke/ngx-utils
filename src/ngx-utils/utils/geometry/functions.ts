import {IPoint} from "../../common-types";

export function dotProduct(a: IPoint, b: IPoint): number {
    return a.x * b.x + a.y * b.y;
}

export function isPoint(v: IPoint | number): v is IPoint {
    return typeof v === "object" && !isNaN(v.x) && !isNaN(v.y);
}

export function perpendicular(p: IPoint): IPoint {
    return {x: -p.y, y: +p.x};
}

export function ptAdd(a: IPoint, b: IPoint): IPoint {
    return {x: a.x + b.x, y: a.y + b.y};
}
export function ptDistance(a: IPoint, b: IPoint): number {
    const x = b.x - a.x;
    const y = b.y - a.y;
    return Math.sqrt(x * x + y * y);
}

export function ptLength(p: IPoint): number {
    return Math.hypot(p.x, p.y);
}

export function ptMultiply(a: IPoint, b: IPoint | number): IPoint {
    const s = isPoint(b) ? b : {x: b, y: b};
    return {x: a.x * s.x, y: a.y * s.y};
}

export function ptSubtract(a: IPoint, b: IPoint): IPoint {
    return {x: a.x - b.x, y: a.y - b.y};
}

export function rotateDeg(p: IPoint, ang: number): IPoint {
    return rotateRad(p, toRadians(ang));
}

export function rotateRad(p: IPoint, ang: number): IPoint {
    const c = Math.cos(ang), s = Math.sin(ang);
    return {x: p.x * c - p.y * s, y: p.x * s + p.y * c};
}

export function toDegrees(rad: number): number {
    return rad * 180 / Math.PI;
}

export function toRadians(deg: number): number {
    return deg * Math.PI / 180;
}
