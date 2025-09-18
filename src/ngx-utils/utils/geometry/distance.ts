import {IPoint, IShape} from "../../common-types";
import {dotProduct, ptAdd, ptLength, ptMultiply, ptSubtract} from "./functions";

interface SimplexLine {
    p: IPoint;
    a: IPoint;
    b: IPoint;
}

type Simplex = SimplexLine[];

interface ClosestPointResult {
    simplex: Simplex;
    closest: IPoint;
    bary: number[];
}

function combineA(simplex: Simplex, bary: number[]): IPoint {
    let out: IPoint = {x: 0, y: 0};
    for (let i = 0; i < simplex.length; i++) out = ptAdd(out, ptMultiply(simplex[i].a, bary[i] || 0));
    return out;
}

function combineB(simplex: Simplex, bary: number[]): IPoint {
    let out: IPoint = {x: 0, y: 0};
    for (let i = 0; i < simplex.length; i++) out = ptAdd(out, ptMultiply(simplex[i].b, bary[i] || 0));
    return out;
}

export function closestPointToOrigin(simplex: Simplex): ClosestPointResult {
    // returns { simplex: prunedSimplex, closest: vec, bary: weights[] }
    if (simplex.length === 1) {
        return {simplex, closest: simplex[0].p, bary: [1]};
    }
    if (simplex.length === 2) {
        const A = simplex[0], B = simplex[1];
        const ab = ptSubtract(B.p, A.p);
        const ab2 = dotProduct(ab, ab);
        if (ab2 <= 1e-18) {
            return {simplex: [B], closest: B.p, bary: [1]};
        }
        const t = Math.max(0, Math.min(1, -dotProduct(A.p, ab) / ab2));
        const closest = ptAdd(A.p, ptMultiply(ab, t));
        if (t <= 1e-9) {
            return {simplex: [A], closest: A.p, bary: [1]};
        }
        if (t >= 1 - 1e-9) {
            return {simplex: [B], closest: B.p, bary: [1]};
        }
        return {simplex: [A, B], closest, bary: [1 - t, t]};
    }
    // Triangle case (A,B,C) – use Ericson's closest-point to triangle (p=origin)
    const A = simplex[0], B = simplex[1], C = simplex[2];
    const a = A.p, b = B.p, c = C.p;
    const ab = ptSubtract(b, a), ac = ptSubtract(c, a), ap = {x: -a.x, y: -a.y};
    const d1 = dotProduct(ab, ap), d2 = dotProduct(ac, ap);
    if (d1 <= 0 && d2 <= 0) return {simplex: [A], closest: a, bary: [1]};
    const bp = {x: -b.x, y: -b.y};
    const d3 = dotProduct(ab, bp), d4 = dotProduct(ac, bp);
    if (d3 >= 0 && d4 <= d3) return {simplex: [B], closest: b, bary: [1]};
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        const closest = ptAdd(a, ptMultiply(ab, v));
        return {simplex: [A, B], closest, bary: [1 - v, v]};
    }
    const cp = {x: -c.x, y: -c.y};
    const bc = ptSubtract(c, b);
    const d5 = dotProduct(bc, cp), d6 = dotProduct(ac, cp);
    if (d6 >= 0 && d5 <= d6) return {simplex: [C], closest: c, bary: [1]};
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6);
        const closest = ptAdd(a, ptMultiply(ac, w));
        return {simplex: [A, C], closest, bary: [1 - w, 0, w]};
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0) {
        const denom = (d4 - d3) + (d5 - d6);
        const w = denom !== 0 ? (d4 - d3) / denom : 0.5;
        const closest = ptAdd(b, ptMultiply(bc, w));
        return {simplex: [B, C], closest, bary: [0, 1 - w, w]};
    }
    // Origin inside triangle – distance is zero
    return {simplex: [A, B, C], closest: {x: 0, y: 0}, bary: [0, 0, 0]};
}

/**
 * ====== GJK distance (2D) ======
 * We keep, for each simplex vertex, the Minkowski point p = a - b and the witnesses a,b.
 * @param A
 * @param B
 */
export function gjkDistance(A: IShape, B: IShape) {
    const MAX = 64, EPS = 1e-9;
    const centerA = {x: A.x, y: A.y}, centerB = {x: B.x, y: B.y};
    let d = ptSubtract(centerB, centerA);

    if (Math.abs(d.x) < EPS && Math.abs(d.y) < EPS) d = {x: 1, y: 0};

    const sup = (dir: IPoint): SimplexLine => {
        const a = A.support(dir);
        const b = B.support({x: -dir.x, y: -dir.y});
        return {p: ptSubtract(a, b), a, b};
    };

    let simplex: Simplex = [sup(d)];
    let closest = simplex[0].p; // vector to origin
    let dir: IPoint = {x: -closest.x, y: -closest.y};
    let best2 = dotProduct(closest, closest);

    for (let iter = 0; iter < MAX; iter++) {
        if (ptLength(dir) <= EPS) { // origin reached
            const a = simplex[simplex.length - 1].a, b = simplex[simplex.length - 1].b;
            return {distance: 0, pa: a, pb: b};
        }
        const vtx = sup(dir);
        // termination: support didn't pass beyond previous closest along dir
        if (dotProduct(vtx.p, dir) - Math.sqrt(best2) <= EPS) {
            break;
        }
        simplex.push(vtx);
        const reduced = closestPointToOrigin(simplex);
        simplex = reduced.simplex;
        closest = reduced.closest;
        best2 = dotProduct(closest, closest);
        dir = {x: -closest.x, y: -closest.y};
        if (best2 <= EPS * EPS) {
            const pa = combineA(simplex, reduced.bary);
            const pb = combineB(simplex, reduced.bary);
            return {distance: 0, pa, pb};
        }
    }

    const res = closestPointToOrigin(simplex);
    const pa = combineA(simplex, res.bary);
    const pb = combineB(simplex, res.bary);
    return {distance: Math.sqrt(dotProduct(res.closest, res.closest)), pa, pb};
}
