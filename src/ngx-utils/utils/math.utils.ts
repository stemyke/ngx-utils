import {ObjectUtils} from "./object.utils";

export class MathUtils {

    static equal(a: number, b: number, epsilon: number = null): boolean {
        epsilon = ObjectUtils.isNumber(epsilon) ? epsilon : Math.E;
        return Math.abs( a - b ) < epsilon;
    }

    static clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(value, max), min)
    }

    static round(value: number, precision: number = 2, divider: number = 1): number {
        precision = Math.pow(10, precision);
        return Math.round(value * precision / divider) / precision;
    }
}
