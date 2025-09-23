import {IPoint, IShape, ShapeDistance, ShapeIntersection} from "../../common-types";
import {tripleProduct, subPts, ensurePoint, negatePt, lerpPts, distance, addPts} from "./functions";
import {EPSILON} from "../math.utils";

interface SimplexLine {
    p: IPoint;
    a: IPoint;
    b: IPoint;
}

type Simplex = SimplexLine[];

interface Dir {
    x: number;
    y: number;
}

const MAX_ITERS = 40;

// =========================
// GJK distance (robust)
// =========================
export function gjkDistance(A: IShape, B: IShape): ShapeDistance {

    let intersection = gjkIntersection(A, B);

    if (intersection.hit) return {distance: 0};

    const ca = A.center;
    const cb = B.center;

    let s = 0;
    let e = 1;
    let center = ca;
    let iters = 0;

    while (e - s > EPSILON) {
        iters++;
        const t = (e + s) / 2;
        const a = A.move(lerpPts(ca, cb, t));
        const test = gjkIntersection(a, B);
        center = a.center;
        if (test.hit) {
            intersection = test;
            e = t;
            if (iters >= MAX_ITERS) break;
        } else {
            s = t;
        }
    }

    const result = distance(ca, center);

    return {
        distance: result,
        pa: result > 0 ? addPts(intersection.pa, subPts(ca, center)) : null,
        pb: result > 0 ? intersection.pb : null
    };
}

// =========================
// Boolean GJK (robust)
// =========================
export function gjkIntersection(A: IShape, B: IShape): ShapeIntersection {
    const MAX = 64, EPS = 1e-12;
    const sup = (dir: IPoint): SimplexLine => {
        const a = ensurePoint(A.support(dir), A.center);
        const b = ensurePoint(B.support(negatePt(dir)), B.center);
        return {p: subPts(a, b), a, b};
    };
    // initial direction: center-to-center; fall back to x-axis
    let d = subPts(B.center, A.center);
    if (Math.abs(d.x) < EPS && Math.abs(d.y) < EPS) d = {x: 1, y: 0};

    const simplex: Simplex = [sup(d)];
    d = {x: -simplex[0].p.x, y: -simplex[0].p.y};

    for (let i = 0; i < MAX; i++) {
        // If direction collapses, steer toward origin from last point
        const dLen = Math.hypot(d.x, d.y);
        if (dLen <= EPS) {
            const last = simplex[simplex.length - 1];
            const AO = {x: -last.p.x, y: -last.p.y};
            const aoLen = Math.hypot(AO.x, AO.y);
            d = (aoLen > EPS) ? AO : {x: 1, y: 0};
        }

        const a = sup(d);
        const s = a.p.x * d.x + a.p.y * d.y;
        if (s < -1e-12) return {hit: false}; // definite separation
        if (Math.abs(s) <= 1e-12) { // tangential contact: use normal ±d
            const L = Math.hypot(d.x, d.y) || 1;
            const n = {x: d.x / L, y: d.y / L};
            const pa = ensurePoint(A.support(n), A.center);
            const pb = ensurePoint(B.support(negatePt(n)), B.center);
            const point = {x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2};
            return {hit: true, pa, pb, point};
        }

        simplex.push(a);
        {
            const info = doSimplexBoolean(simplex, d);
            if (info.hit) return info;
        }
    }
    // Max iterations without resolution → disjoint
    return {hit: false};
}

function doSimplexBoolean(simplex: Simplex, d: Dir): ShapeIntersection {
    const last = simplex[simplex.length - 1];
    const AO = {x: -last.p.x, y: -last.p.y};

    if (simplex.length === 2) {
        const B = simplex[0];
        const AB = {x: B.p.x - last.p.x, y: B.p.y - last.p.y};
        // Perpendicular to AB toward origin
        const abPerp = tripleProduct(AB, AO, AB);
        const perpLen2 = abPerp.x * abPerp.x + abPerp.y * abPerp.y;

        if (perpLen2 < 1e-24) {
            // Colinear: project origin onto segment AB
            const ab2 = AB.x * AB.x + AB.y * AB.y;
            if (ab2 > 0) {
                const t = ((AO.x * AB.x + AO.y * AB.y) / ab2);
                if (t >= 0 && t <= 1) {
                    // Contact at segment
                    const pa = {x: last.a.x + t * (B.a.x - last.a.x), y: last.a.y + t * (B.a.y - last.a.y)};
                    const pb = {x: last.b.x + t * (B.b.x - last.b.x), y: last.b.y + t * (B.b.y - last.b.y)};
                    const point = {x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2};
                    return {hit: true, pa, pb, point};
                }
            }
            // Otherwise, move toward origin from A, keep only last point to progress
            d.x = -AO.x;
            d.y = -AO.y;
            simplex.splice(0, simplex.length - 1);
            return {hit: false};
        }
        d.x = abPerp.x;
        d.y = abPerp.y;
        return {hit: false};
    }

    // Triangle case: [C, B, A] with A = last
    const A = last, B = simplex[simplex.length - 2], C = simplex[simplex.length - 3];
    const AB = {x: B.p.x - A.p.x, y: B.p.y - A.p.y};
    const AC = {x: C.p.x - A.p.x, y: C.p.y - A.p.y};
    const ABperp = tripleProduct(AC, AB, AB);
    const ACperp = tripleProduct(AB, AC, AC);

    // If origin is outside AB region
    if (ABperp.x * AO.x + ABperp.y * AO.y > 0) {
        simplex.splice(simplex.length - 3, 1);
        d.x = ABperp.x;
        d.y = ABperp.y;
        return {hit: false};
    }
    // If origin is outside AC region
    if (ACperp.x * AO.x + ACperp.y * AO.y > 0) {
        simplex.splice(simplex.length - 2, 1);
        d.x = ACperp.x;
        d.y = ACperp.y;
        return {hit: false};
    }
    // Otherwise the origin is inside the triangle → overlap
    // Compute barycentric weights of origin w.r.t triangle (A,B,C)
    const v0 = AB; // B-A
    const v1 = AC; // C-A
    const b = {x: -A.p.x, y: -A.p.y};
    const det = v0.x * v1.y - v0.y * v1.x;
    let uA, uB, uC;
    if (Math.abs(det) > 1e-24) {
        const alpha = (b.x * v1.y - v1.x * b.y) / det; // weight for v0 (B)
        const beta = (v0.x * b.y - b.x * v0.y) / det; // weight for v1 (C)
        uB = alpha;
        uC = beta;
        uA = 1 - alpha - beta;
    } else {
        // Fallback: equal weights
        uA = uB = uC = 1 / 3;
    }
    const pa = {
        x: uA * A.a.x + uB * B.a.x + uC * C.a.x,
        y: uA * A.a.y + uB * B.a.y + uC * C.a.y
    };
    const pb = {
        x: uA * A.b.x + uB * B.b.x + uC * C.b.x,
        y: uA * A.b.y + uB * B.b.y + uC * C.b.y
    };
    const point = {x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2};
    return {hit: true, pa, pb, point};
}
