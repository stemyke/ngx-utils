import {IPoint, IShape, ShapeDistance, ShapeIntersection} from "../../common-types";
import {
    tripleProduct,
    subPts,
    ensurePoint,
    negatePt,
    lerpPts,
    distance,
    addPts,
    normalizePt,
    dotProduct, lengthOfPt, scalePt, lengthSq
} from "./functions";
import {clamp, EPSILON} from "../math.utils";
import {dot} from "node:test/reporters";

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


// =========================
// GJK distance (robust)
// =========================
const MAX_ITERS = 40;
const GJK_EPS = 1e-9;

export function gjkDistance(A: IShape, B: IShape): ShapeDistance {
    // 1) Fast boolean hit check using your existing intersection logic
    const inter = gjkIntersection(A, B);
    if (inter.hit) {
        return { distance: 0, pa: inter.pa, pb: inter.pb };
    }

    // 2) Initialization
    let d = subPts(B.center, A.center);
    if (Math.hypot(d.x, d.y) < GJK_EPS) d = { x: 1, y: 0 };

    const simplex: {p: IPoint, a: IPoint, b: IPoint}[] = [];
    let lastDistSq = Infinity;

    // 3) GJK Distance Loop
    for (let i = 0; i < MAX_ITERS; i++) {
        const pa = A.support(d);
        const pb = B.support(negatePt(d));
        const p = subPts(pa, pb);

        // Check if new point moves us past origin in direction d
        const dotP = p.x * d.x + p.y * d.y;
        if (lastDistSq !== Infinity && (dotP < 0 || Math.abs(lastDistSq - dotP) < GJK_EPS)) {
            break;
        }

        simplex.push({ p, a: pa, b: pb });

        // Calculate closest point on Simplex
        const result = solveDistanceSimplex(simplex);
        const distSq = result.closest.x * result.closest.x + result.closest.y * result.closest.y;

        // If distance is zero, we are overlapping
        if (distSq < GJK_EPS) {
            return { distance: 0, pa: result.pa, pb: result.pb };
        }

        if (lastDistSq - distSq < GJK_EPS) break;
        lastDistSq = distSq;

        // Search direction: From closest point P to Origin
        d = { x: -result.closest.x, y: -result.closest.y };
        if (Math.hypot(d.x, d.y) < GJK_EPS) break;
    }

    const final = solveDistanceSimplex(simplex);
    return {
        distance: Math.sqrt(lastDistSq),
        pa: final.pa,
        pb: final.pb
    };
}

function solveDistanceSimplex(simplex: {p: IPoint, a: IPoint, b: IPoint}[]) {
    if (simplex.length === 1) {
        return { closest: simplex[0].p, pa: simplex[0].a, pb: simplex[0].b };
    }

    // Segment B-A
    const B = simplex[simplex.length - 1];
    const A = simplex[simplex.length - 2];
    const AB = subPts(A.p, B.p);
    const BO = { x: -B.p.x, y: -B.p.y };

    const abLenSq = AB.x * AB.x + AB.y * AB.y;
    let t = (abLenSq > 1e-12) ? (BO.x * AB.x + BO.y * AB.y) / abLenSq : 0;
    t = Math.max(0, Math.min(1, t));

    // For distance calculation, always reduce to the best 2 points
    if (simplex.length > 2) simplex.splice(0, simplex.length - 2);

    return {
        closest: { x: B.p.x + AB.x * t, y: B.p.y + AB.y * t },
        pa: { x: B.a.x + (A.a.x - B.a.x) * t, y: B.a.y + (A.a.y - B.a.y) * t },
        pb: { x: B.b.x + (A.b.x - B.b.x) * t, y: B.b.y + (A.b.y - B.b.y) * t }
    };
}

// =========================
// Boolean GJK (robust)
// =========================
export function gjkIntersection(A: IShape, B: IShape): ShapeIntersection {
    for (const AA of getShapes(A)) {
        for (const BB of getShapes(B)) {
            const int = gjkIntersectionSingle(AA, BB);
            if (int.hit) return int;
        }
    }
    return {hit: false};
}

function gjkIntersectionSingle(A: IShape, B: IShape): ShapeIntersection {
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

function* getShapes(shape: IShape, worldX: number = 0, worldY: number = 0): Generator<IShape> {
    if (!shape) return;

    // Calculate this specific shape's actual world position
    const currentWorldX = worldX + shape.x;
    const currentWorldY = worldY + shape.y;

    if (!shape.subShapes || shape.subShapes.length === 0) {
        // Yield a temporary 'leaf' shape moved to the correct world coordinate
        yield shape.move({ x: currentWorldX, y: currentWorldY });
        return;
    }

    // Recurse into children, passing down the current world position
    for (const sub of shape.subShapes) {
        yield* getShapes(sub, currentWorldX, currentWorldY);
    }
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
