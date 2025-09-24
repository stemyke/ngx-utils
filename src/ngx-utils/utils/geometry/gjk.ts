import {IPoint, IShape, ShapeDistance, ShapeIntersection} from "../../common-types";
import {tripleProduct, subPts, ensurePoint, negatePt, lerpPts, distance, addPts, normalizePt} from "./functions";
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
    // 1) Quick overlap
    const inter = gjkIntersection(A, B);
    if (inter.hit) {
        // Pass through pa/pb
        return { distance: 0, pa: inter.pa ?? null, pb: inter.pb ?? null };
    }

    const ca = A.center;
    const cb = B.center;

    // 2) Bisection along the center-line to find the first hit pose
    let s = 0;
    let e = 1;
    let iters = 0;

    // Keep the best "hit" snapshot and its center so we can map witnesses back
    let hitSnap: ReturnType<typeof gjkIntersection> | null = null;
    let hitCenter = ca;

    while ((e - s) > EPSILON && iters < MAX_ITERS) {
        iters++;
        const t = (e + s) * 0.5;

        // Assumes A.move(newCenter) returns a NEW shape whose center is exactly this point
        const aMoved = A.move(lerpPts(ca, cb, t));
        const test = gjkIntersection(aMoved, B);

        if (test.hit) {
            hitSnap = test;
            hitCenter = aMoved.center;
            e = t; // shrink toward contact
        } else {
            s = t; // still separated
        }
    }

    // 3) Make sure we end with a hit snapshot (in case we stopped on iteration cap)
    if (!hitSnap) {
        const aMoved = A.move(lerpPts(ca, cb, e));
        const test = gjkIntersection(aMoved, B);
        if (test.hit) {
            hitSnap = test;
            hitCenter = aMoved.center;
        } else {
            // Extremely degenerate: no hit even at e ~ 1 (shouldn't happen for non-degenerate shapes).
            // Fall back to center-line direction as a last resort.
            const dir = normalizePt(subPts(cb, ca));
            const pa0 = A.support(dir);
            const pb0 = B.support(negatePt(dir));
            return { distance: distance(pa0, pb0), pa: pa0, pb: pb0 };
        }
    }

    // 4) Map witnesses back to the original A pose
    //    (We moved A by (hitCenter - ca); to undo, offset A's witness by (ca - hitCenter))
    const offset = subPts(ca, hitCenter);
    const pa0 = addPts(hitSnap!.pa, offset);
    const pb0 = hitSnap!.pb;

    // 5) True geometric separation is the distance between these boundary points
    const d = distance(pa0, pb0);

    return {
        distance: d,
        pa: d > 0 ? pa0 : null,
        pb: d > 0 ? pb0 : null
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
    const perpAB = tripleProduct(AC, AB, AB);
    const perpAC = tripleProduct(AB, AC, AC);

    // If origin is outside AB region
    if (perpAB.x * AO.x + perpAB.y * AO.y > 0) {
        simplex.splice(simplex.length - 3, 1);
        d.x = perpAB.x;
        d.y = perpAB.y;
        return {hit: false};
    }
    // If origin is outside AC region
    if (perpAC.x * AO.x + perpAC.y * AO.y > 0) {
        simplex.splice(simplex.length - 2, 1);
        d.x = perpAC.x;
        d.y = perpAC.y;
        return {hit: false};
    }
    // Otherwise the origin is inside the triangle → overlap
    // Compute barycentric weights of origin w.r.t triangle (A,B,C)
    const v0 = AB; // B-A
    const v1 = AC; // C-A
    const b = {x: -A.p.x, y: -A.p.y};
    const det = v0.x * v1.y - v0.y * v1.x;
    let uA: number, uB: number, uC: number;
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
