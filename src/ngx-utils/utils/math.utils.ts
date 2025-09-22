import {ObjectUtils} from "./object.utils";
import {RangeCoords} from "../common-types";

export const EPSILON = 1e-9;

/**
 * Normalize a range
 * @param minOrRange
 * @param max
 */
export function normalizeRange(minOrRange: number | RangeCoords, max?: number): RangeCoords {
    const min = (Array.isArray(minOrRange) ? minOrRange[0] : minOrRange) ?? 0;
    max = (Array.isArray(minOrRange) ? minOrRange[1] : max) ?? 1;
    return (max < min) ? [max, min] : [min, max];
}

/**
 * Clamps a value to a range
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number | RangeCoords, max?: number): number {
    const range = normalizeRange(min, max);
    return Math.max(Math.min(value, range[1]), range[0]);
}

/**
 * Clamps a value to a range in a way, that when it is over in one end, then it appears from the other end
 * @param value
 * @param min
 * @param max
 */
export function overflow(value: number, min: number | RangeCoords, max?: number) {
    const range = normalizeRange(min, max);
    const length = range[1] - range[0];
    return ((((value - range[0]) % length) + length) % length) + range[0];
}

export class MathUtils {

    static equal(a: number, b: number, epsilon: number = null): boolean {
        epsilon = ObjectUtils.isNumber(epsilon) ? epsilon : EPSILON;
        return Math.abs(a - b) < epsilon;
    }

    static clamp(value: number, min: number, max: number): number {
        return clamp(value, min, max);
    }

    static round(value: number, precision: number = 2, divider: number = 1): number {
        precision = Math.pow(10, precision);
        return Math.round(value * precision / divider) / precision;
    }

    static approxIndex(x: number, values: number[], epsilon: number = null): number {
        if (!Array.isArray(values) || values.length == 0) {
            return -1;
        }
        let s = 0;
        let e = values.length - 1;
        while (s <= e) {
            const i = Math.floor((s + e) / 2);
            const v = values[i];
            if (MathUtils.equal(v, x, epsilon)) {
                return i;
            }
            if (v < x) {
                s = i + 1;
            } else {
                e = i - 1;
            }
        }
        const m = Math.max(e, 0);
        const a = values[s];
        const b = values[m];
        return Math.abs(a - x) < Math.abs(b - x) ? s : m;
    }

    static approximate(x: number, values: number[], epsilon: number = null): number {
        const index = MathUtils.approxIndex(x, values, epsilon);
        return values[index] ?? null;
    }
}
