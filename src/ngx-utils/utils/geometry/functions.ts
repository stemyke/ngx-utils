import {IPoint} from "../../common-types";

export function dotProduct(a: IPoint, b: IPoint): number {
    return a.x * b.x + a.y * b.y;
}

export function tripleProduct(a: IPoint, b: IPoint, c: IPoint): IPoint {
    const ac=a.x*c.x+a.y*c.y;
    const bc=b.x*c.x+b.y*c.y;
    return {x:b.x*ac-a.x*bc,y:b.y*ac-a.y*bc};
}

export function isPoint(v: IPoint | number): v is IPoint {
    return typeof v === "object" && Number.isFinite(v.x) && Number.isFinite(v.y);
}

export function ensurePoint(p: IPoint, fallback: IPoint = {x: 0, y: 0}): IPoint {
    return isPoint(p) ? {x: +p.x, y: +p.y} : fallback;
}

export function perpendicular(p: IPoint): IPoint {
    return {x: -p.y, y: +p.x};
}

export function negatePt(p: IPoint): IPoint {
    return {x: -p.x, y: -p.y};
}

export function normalizePt(p: IPoint): IPoint {
    const length = lengthOfPt(p);
    return dividePts(p, length);
}

export function addPts(a: IPoint, b: IPoint): IPoint {
    return {x: a.x + b.x, y: a.y + b.y};
}

export function distanceSq(a: IPoint, b: IPoint): number {
    const x = b.x - a.x;
    const y = b.y - a.y;
    return x * x + y * y;
}

export function distance(a: IPoint, b: IPoint): number {
    return Math.sqrt(distanceSq(a, b));
}

export function lerpPts(a: IPoint, b: IPoint, t: number): IPoint {
    const diff = subPts(b, a);
    return addPts(a, multiplyPts(diff, t));
}

export function lengthOfPt(p: IPoint): number {
    return Math.hypot(p.x, p.y);
}

export function multiplyPts(a: IPoint, b: IPoint | number): IPoint {
    const s = isPoint(b) ? b : {x: b, y: b};
    return {x: a.x * s.x, y: a.y * s.y};
}

export function dividePts(a: IPoint, b: IPoint | number): IPoint {
    const s = isPoint(b) ? b : {x: b, y: b};
    return {x: a.x / s.x, y: a.y / s.y};
}

export function subPts(a: IPoint, b: IPoint): IPoint {
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
