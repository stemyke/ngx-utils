import {ObjectUtils} from "./object.utils";

export class ArrayUtils {

    static has(arr: any[], ...items: any[]): boolean {
        if (!ObjectUtils.isArray(arr) || !ObjectUtils.isArray(items)) return false;
        for (let i = 0; i < items.length; i++) {
            if (arr.indexOf(items[i]) >= 0) return true;
        }
        return false;
    }

    static match(arr: any[], str: string): boolean {
        if (!ObjectUtils.isArray(arr) || !ObjectUtils.isString(str)) return false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] instanceof RegExp) {
                const regex = <RegExp>arr[i];
                if (regex.test(str)) return true;
            }
        }
        return false;
    }

    static any(arr: any[], cb: (item: any) => boolean): boolean {
        if (!ObjectUtils.isArray(arr) || !ObjectUtils.isFunction(cb)) return false;
        for (let i = 0; i < arr.length; i++) {
            if (cb(arr[i])) return true;
        }
        return false;
    }

    static move(arr: any[], oldIndex: number, newIndex: number): any[] {
        if (!ObjectUtils.isArray(arr)) return [];
        const length = arr.length;
        while (oldIndex < 0) {
            oldIndex += length;
        }
        while (newIndex < 0) {
            newIndex += length;
        }
        if (newIndex >= length) {
            let k = newIndex - length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
    }

    static reversed(arr: any[]): any[] {
        const result = [];
        if (!ObjectUtils.isArray(arr)) return result;
        for (let i = arr.length - 1; i >= 0; i--) {
            result.push(arr[i]);
        }
        return result;
    }

    static min(arr: any[], cb: (item: any, index?: number) => number): any {
        if (!ObjectUtils.isArray(arr)) return 0;
        let min = Number.MAX_SAFE_INTEGER;
        let result = null;
        for (let i = 0; i < arr.length; i++) {
            const current = cb(arr[i], i);
            if (current < min || result === null) {
                min = current;
                result = arr[i];
            }
        }
        return result;
    }

    static max(arr: any[], cb: (item: any, index?: number) => number): any {
        if (!ObjectUtils.isArray(arr)) return 0;
        let max = Number.MIN_SAFE_INTEGER;
        let result = null;
        for (let i = 0; i < arr.length; i++) {
            const current = cb(arr[i], i);
            if (current > max || result === null) {
                max = current;
                result = arr[i];
            }
        }
        return result;
    }
}
