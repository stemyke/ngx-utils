import {isArray, isDate, isNullOrUndefined, isPrimitive} from "util";
const defaultPredicate = (value: any, key: any) => true;

export type FilterPrecidate = (value: any, key?: any) => boolean;
export type IterateCallback = (value: any, key?: any) => void;
export class ObjectUtils {

    static compare(a, b): number {
        if ((a === null || b === null) || (typeof a != typeof b)) {
            return null;
        }
        if (typeof a === "string") {
            return (a).localeCompare(b);
        } else {
            if (a instanceof Date) {
                a = a.getTime();
                b = b.getTime();
            }
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            }
            return 0;
        }
    }

    static evaluate(expr: string, context: any = {}): any {
        expr = Object.keys(context).reduce((res, key) => `var ${key} = this['${key}']; ${res}`, expr);
        return (() => eval(expr)).call(context);
    }

    static empty(obj: any): boolean {
        return !obj || Object.keys(obj).length == 0;
    }

    static iterate(obj: any, cb: IterateCallback): void {
        if (!obj) return;
        const keys: any[] = isArray(obj) ? obj.map((e, i) => i) : Object.keys(obj);
        keys.forEach(key => {
            cb(obj[key], key);
        });
    }

    static filter(obj: any, predicate: FilterPrecidate): any {
        return this.copyRecursive(null, obj, predicate);
    }

    static copy<T>(obj: T): T {
        return this.copyRecursive(null, obj);
    }

    static assign<T>(target: T, source: any): T {
        return this.copyRecursive(target, source);
    }

    static checkInterface(obj: any, itface: any): boolean {
        if (!obj) return false;
        for (const key in itface) {
            if (typeof obj[key] !== itface[key]) return false;
        }
        return true;
    }

    private static copyRecursive(target: any, source: any, predicate?: FilterPrecidate): any {
        predicate = predicate || defaultPredicate;
        if (isNullOrUndefined(source)) return target || source;
        if (isPrimitive(source) || isDate(source)) return source;
        if (isArray(source)) {
            target = isArray(target) || [];
            let i = 0;
            source.forEach((item, index) => {
                if (!predicate(item, index)) return;
                if (target.length > i)
                    target[i] = this.copyRecursive(target[i], item, predicate);
                else
                    target.push(this.copyRecursive(item, predicate));
                i++;
            });
            return target;
        }
        return Object.keys(source).reduce((result, key) => {
            if (!predicate(source[key], key)) return result;
            result[key] = this.copyRecursive(result[key], source[key], predicate);
            return result;
        }, target || {});
    }
}
