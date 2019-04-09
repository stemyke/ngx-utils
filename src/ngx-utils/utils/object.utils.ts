export type FilterPrecidate = (value: any, key?: any, target?: any, source?: any) => boolean;
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
        let result = null;
        try {
            result = (() => eval(expr)).call(context);
        } catch (e) {
            console.log(`Failed to parse expression: ${e.message}`, expr, context);
        }
        return result;
    }

    static empty(obj: any): boolean {
        return !obj || Object.keys(obj).length == 0;
    }

    static iterate(obj: any, cb: IterateCallback): void {
        if (!obj) return;
        const keys: any[] = Array.isArray(obj) ? Array.from(obj.keys()) : Object.keys(obj);
        keys.forEach(
            // @dynamic
            key => {
                cb(obj[key], key);
            }
        );
    }

    static getValue(obj: any, key: string, defaultValue?: any, treeFallback: boolean = false): any {
        key = key || "";
        const keys = key.split(".");
        let curKey = "";
        do {
            curKey += keys.shift();
            if (ObjectUtils.isDefined(obj) && ObjectUtils.isDefined(obj[curKey]) && (typeof obj[curKey] === "object" || !keys.length)) {
                obj = obj[curKey];
                curKey = "";
            } else if (!keys.length) {
                defaultValue = typeof defaultValue == "undefined" ? key.replace(new RegExp(`${curKey}$`), `{${curKey}}`) : defaultValue;
                obj = treeFallback ? obj || defaultValue : defaultValue;
            } else {
                curKey += ".";
            }
        } while (keys.length);
        return obj;
    }

    static mapToPath(target: any, source: any, path: string[]): any {
        if (typeof source === "undefined") return target;
        if (path.length == 0) return source;
        const key: any = path.shift();
        if (key == "*") {
            if (ObjectUtils.isArray(source)) {
                target = ObjectUtils.isArray(target) ? target : [];
                return source.map((item, index) => {
                    return ObjectUtils.mapToPath(target[index], item, Array.from(path));
                });
            }
            if (ObjectUtils.isObject(source)) {
                target = ObjectUtils.isObject(target) ? target : {};
                return Object.keys(source).reduce((result, key) => {
                    result[key] = ObjectUtils.mapToPath(target[key], source[key], Array.from(path));
                    return result;
                }, {});
            }
            return ObjectUtils.isNullOrUndefined(target) ? null : target;
        }
        const isArray = ObjectUtils.isArray(target);
        target = ObjectUtils.isObject(target) || isArray ? target : {};
        target[key] = ObjectUtils.mapToPath(target[key], source, Array.from(path));
        return isNaN(key) || isArray ? target : Object.values(target);
    }

    static filter(obj: any, predicate: FilterPrecidate): any {
        return ObjectUtils.copyRecursive(null, obj, predicate);
    }

    static copy<T>(obj: T): T {
        return ObjectUtils.copyRecursive(null, obj);
    }

    static assign<T>(target: T, source: any, predicate?: FilterPrecidate): T {
        return ObjectUtils.copyRecursive(target, source, predicate);
    }

    static getType(obj: any): string {
        const regex = new RegExp("\\s([a-zA-Z]+)");
        return Object.prototype.toString.call(obj).match(regex)[1].toLowerCase();
    }

    static isPrimitive(value: any): boolean {
        const type = typeof value;
        return value == null || (type !== "object" && type !== "function");
    }

    static isObject(value: any): boolean {
        return ObjectUtils.getType(value) === "object";
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

    static isBlob(value: any): value is Blob {
        return value instanceof Blob || value instanceof File;
    }

    static isBoolean(value: any): value is boolean {
        return typeof(value) == typeof(true);
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

    static isSet(value: any): value is Set<any> {
        return value instanceof Set;
    }

    static checkInterface(obj: any, interFaceObject: any): boolean {
        if (!obj) return false;
        for (const key in interFaceObject) {
            if (interFaceObject.hasOwnProperty(key) && typeof obj[key] !== interFaceObject[key]) return false;
        }
        return true;
    }

    static pad(obj: any, width: number, chr: string = "0"): string {
        const str = ObjectUtils.isDefined(obj) ? obj.toString() : "";
        return str.length >= width ? str : new Array(width - str.length + 1).join(chr) + str;
    }

    private static copyRecursive(target: any, source: any, predicate?: FilterPrecidate): any {
        predicate = predicate || defaultPredicate;
        if (ObjectUtils.isPrimitive(source) || ObjectUtils.isDate(source) || ObjectUtils.isBlob(source)) return source;
        if (ObjectUtils.isArray(source)) {
            target = ObjectUtils.isArray(target) ? Array.from(target) : [];
            source.forEach((item, index) => {
                if (!predicate(item, index, target, source)) return;
                if (target.length > index)
                    target[index] = ObjectUtils.copyRecursive(target[index], item, predicate);
                else
                    target.push(ObjectUtils.copyRecursive(null, item, predicate));
            });
            return target;
        }
        return Object.keys(source).reduce((result, key) => {
            if (!predicate(source[key], key, result, source)) return result;
            result[key] = ObjectUtils.copyRecursive(result[key], source[key], predicate);
            return result;
        }, Object.assign({}, target));
    }
}
