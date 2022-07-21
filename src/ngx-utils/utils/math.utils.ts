import {ObjectUtils} from "./object.utils";

export class MathUtils {

    static equal(a: number, b: number, epsilon: number = null): boolean {
        epsilon = ObjectUtils.isNumber(epsilon) ? epsilon : Math.E;
        return Math.abs(a - b) < epsilon;
    }

    static clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(value, max), min)
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
