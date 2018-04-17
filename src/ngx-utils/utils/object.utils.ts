export type FilterPrecidate = (value: any, key?: any) => boolean;
export type IterateCallback = (value: any, key?: any) => void;

const defaultPredicate: FilterPrecidate = () => true;

export class ObjectUtils {

    static compare(a: any, b: any): number {
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

    static equals(a: any, b: any): boolean {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a !== a && b !== b) return true; // NaN === NaN
        const at = typeof a, bt = typeof b;
        let length: number, key: any, keySet: any;
        if (at == bt && at == "object") {
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) return false;
                if ((length = a.length) == b.length) {
                    for (key = 0; key < length; key++) {
                        if (!ObjectUtils.equals(a[key], b[key])) return false;
                    }
                    return true;
                }
            } else {
                if (Array.isArray(b)) {
                    return false;
                }
                keySet = Object.create(null);
                for (key in a) {
                    if (a.hasOwnProperty(key)) {
                        if (!ObjectUtils.equals(a[key], b[key])) {
                            return false;
                        }
                        keySet[key] = true;
                    }
                }
                for (key in b) {
                    if (b.hasOwnProperty(key) && !(key in keySet) && typeof b[key] !== "undefined") {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    static evaluate(expr: string, context: any = {}): any {
        expr = Object.keys(context).reduce((res, key) => `var ${key} = this['${key}']; ${res}`, expr);
        return (
            // @dynamic
            () => eval(expr)
        ).call(context);
    }

    static empty(obj: any): boolean {
        return !obj || Object.keys(obj).length == 0;
    }

    static iterate(obj: any, cb: IterateCallback): void {
        if (!obj) return;
        const keys: any[] = Array.isArray(obj) ? obj.map((e, i) => i) : Object.keys(obj);
        keys.forEach(
            // @dynamic
            key => {
                cb(obj[key], key);
            }
        );
    }

    static getValue(obj: any, key: string): any {
        const keys = key.split(".");
        key = "";
        do {
            key += keys.shift();
            if (ObjectUtils.isDefined(obj) && ObjectUtils.isDefined(obj[key]) && (typeof obj[key] === "object" || !keys.length)) {
                obj = obj[key];
                key = "";
            } else if (!keys.length) {
                obj = undefined;
            } else {
                key += ".";
            }
        } while (keys.length);
        return obj;
    }

    static filter(obj: any, predicate: FilterPrecidate): any {
        return ObjectUtils.copyRecursive(null, obj, predicate);
    }

    static copy<T>(obj: T): T {
        return ObjectUtils.copyRecursive(null, obj);
    }

    static assign<T>(target: T, source: any): T {
        return ObjectUtils.copyRecursive(target, source);
    }

    static isPrimitive(value: any): boolean {
        const type = typeof value;
        return value == null || (type !== "object" && type !== "function");
    }

    static isObject(value: any): boolean {
        return !ObjectUtils.isPrimitive(value);
    }

    static isDefined(value: any): boolean {
        return typeof value !== "undefined" && value !== null;
    }

    static isNullOrUndefined(value: any): boolean {
        return typeof value == "undefined" || value == null;
    }

    static isString(value: any): value is string {
        return typeof value === "string";
    }

    static isFunction(value: any): value is Function {
        return typeof value === "function";
    }

    static isDate(value: any): value is Date {
        return null !== value && !isNaN(value) && "undefined" !== typeof value.getDate;
    }

    static isNumber(value: any): value is number {
        if (typeof value !== "number") return false;
        const num = +value;
        if ((num - num) !== 0) {
            return false;
        }
        if (num === value) {
            return true;
        }
    }

    static isArray(value: any): value is Array<any> {
        return Array.isArray(value);
    }

    static checkInterface(obj: any, interFaceObject: any): boolean {
        if (!obj) return false;
        for (const key in interFaceObject) {
            if (interFaceObject.hasOwnProperty(key) && typeof obj[key] !== interFaceObject[key]) return false;
        }
        return true;
    }

    private static copyRecursive(target: any, source: any, predicate?: FilterPrecidate): any {
        predicate = predicate || defaultPredicate;
        if (ObjectUtils.isNullOrUndefined(source)) return target || source;
        if (ObjectUtils.isPrimitive(source) || ObjectUtils.isDate(source)) return source;
        if (Array.isArray(source)) {
            target = Array.isArray(target) || [];
            let i = 0;
            source.forEach((item, index) => {
                if (!predicate(item, index)) return;
                if (target.length > i)
                    target[i] = ObjectUtils.copyRecursive(target[i], item, predicate);
                else
                    target.push(ObjectUtils.copyRecursive(item, predicate));
                i++;
            });
            return target;
        }
        return Object.keys(source).reduce((result, key) => {
            if (!predicate(source[key], key)) return result;
            result[key] = ObjectUtils.copyRecursive(result[key], source[key], predicate);
            return result;
        }, target || {});
    }
}
