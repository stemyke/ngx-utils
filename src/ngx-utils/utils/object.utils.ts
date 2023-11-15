export type FilterPredicate = (value: any, key?: any, target?: any, source?: any) => boolean;
export type IterateCallback = (value: any, key?: any) => void;

export function defaultPredicate(value: any, key?: any, target?: any, source?: any): boolean {
    return true;
}

export function shouldCopyDefault(key: any, value: any): boolean {
    return true;
}

const hasBlob = typeof Blob !== "undefined" && !!Blob;
const hasFile = typeof File !== "undefined" && !!File;

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

    static getProperties(obj: any): string[] {
        if (!ObjectUtils.isObject(obj) && !ObjectUtils.isFunction(obj)) return [];
        const props = new Set<string>();
        Object.keys(obj).forEach(p => props.add(p));
        Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
        return Array.from(props);
    }

    static equals(a: any, b: any, visited: Set<any> = null): boolean {
        visited = visited || new Set();
        if (visited.has(a) && visited.has(b)) return true;
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a !== a && b !== b) return true; // NaN === NaN
        const at = typeof a, bt = typeof b;
        let length: number, key: any, keySet: any;
        if (at == bt && at == "object") {
            visited.add(a);
            visited.add(b);
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) return false;
                if ((length = a.length) == b.length) {
                    for (key = 0; key < length; key++) {
                        if (!ObjectUtils.equals(a[key], b[key], visited)) return false;
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
                        if (!ObjectUtils.equals(a[key], b[key], visited)) {
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

    static evaluate(expr: string, context: any = {}, res: any = {}): any {
        expr = Object.keys(context).reduce((res, key) => `var ${key} = this['${key}'];\n${res}`, expr);
        const lines = expr.split("\n");
        const lastLine = "return " + lines.pop().replace("return ", "");
        lines.push(lastLine);
        expr = lines.join("\n");
        let result = null;
        try {
            result = new Function(expr).call(context);
        } catch (e) {
            res.exception = e;
            console.log(`Failed to parse expression: ${e.message}`, expr, context);
        }
        res.result = result;
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

    static filter(obj: any, predicate: FilterPredicate): any {
        return ObjectUtils.copyRecursive(null, obj, predicate || defaultPredicate, new Map());
    }

    static copy<T>(obj: T): T {
        return ObjectUtils.copyRecursive(null, obj, defaultPredicate, new Map());
    }

    static assign<T>(target: T, source: any, predicate?: FilterPredicate): T {
        return ObjectUtils.copyRecursive(target, source, predicate || defaultPredicate, new Map());
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
        return (hasBlob && value instanceof Blob) || (hasFile && value instanceof File);
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

    static isConstructor(value: any): boolean {
        return (value && typeof value === "function" && value.prototype && value.prototype.constructor) === value && value.name !== "Object";
    }

    static checkInterface(obj: any, interFaceObject: any): boolean {
        return ObjectUtils.isInterface(obj, interFaceObject);
    }

    static isInterface(obj: any, interFaceObject: any): boolean {
        if (!obj || typeof obj !== "object" || ObjectUtils.isArray(obj) || !ObjectUtils.isObject(interFaceObject)) return false;
        const keys = Object.keys(interFaceObject);
        for (const key of keys) {
            let type = interFaceObject[key] || "";
            if (type.startsWith("*")) {
                type = type.substr(1);
                if (obj.hasOwnProperty(key) && ObjectUtils.getType(obj[key]) !== type) return false;
            } else if (!obj.hasOwnProperty(key) || ObjectUtils.getType(obj[key]) !== type) {
                return false;
            }
        }
        return true;
    }

    static pad(obj: any, width: number, chr: string = "0"): string {
        const str = ObjectUtils.isDefined(obj) ? obj.toString() : "";
        return str.length >= width ? str : new Array(width - str.length + 1).join(chr) + str;
    }

    private static copyRecursive(target: any, source: any, predicate: FilterPredicate, copies: Map<any, any>): any {
        if (ObjectUtils.isPrimitive(source) || ObjectUtils.isDate(source) || ObjectUtils.isBlob(source) || ObjectUtils.isFunction(source)) return source;
        if (copies.has(source)) return copies.get(source);
        if (ObjectUtils.isArray(source)) {
            target = ObjectUtils.isArray(target) ? Array.from(target) : [];
            copies.set(source, target);
            for (let index = 0; index < source.length; index++) {
                const item = source[index];
                if (!predicate(item, index, target, source)) continue;
                if (target.length > index)
                    target[index] = ObjectUtils.copyRecursive(target[index], item, predicate, copies);
                else
                    target.push(ObjectUtils.copyRecursive(null, item, predicate, copies));
            }
            return target;
        }

        // If object defines __shouldCopy as false, then don't copy it
        if (source.__shouldCopy === false) return source;
        // Copy object
        const shouldCopy = ObjectUtils.isFunction(source.__shouldCopy) ? source.__shouldCopy : shouldCopyDefault;
        if (ObjectUtils.isConstructor(source.constructor)) {
            if (!target) {
                try {
                    target = new source.constructor();
                } catch (e) {
                    const proto = source.constructor.prototype || source.prototype;
                    target = Object.create(proto);
                }
            }
        } else {
            target = Object.assign({}, target || {});
        }
        // Set to copies to prevent circular references
        copies.set(source, target);

        // Copy map entries
        if (target instanceof Map) {
            if (source instanceof Map) {
                for (const [key, value] of source.entries()) {
                    if (!predicate(value, key, target, source)) continue;
                    target.set(key, !shouldCopy(key, value) ? value : ObjectUtils.copyRecursive(target.get(key), value, predicate, copies));
                }
            }
            return target;
        }

        // Copy object members
        const keys = Object.keys(source);
        for (const key of keys) {
            if (!predicate(source[key], key, target, source)) continue;
            target[key] = !shouldCopy(key, source[key]) ? source[key] : ObjectUtils.copyRecursive(target[key], source[key], predicate, copies);
        }

        // Copy object properties
        const descriptors = Object.getOwnPropertyDescriptors(source);
        for (const key of Object.keys(descriptors)) {
            if (keys.indexOf(key) >= 0) continue;
            Object.defineProperty(target, key, descriptors[key]);
        }
        return target;
    }
}
