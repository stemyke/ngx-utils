export class JSONfn {

    static parse(text: string): any {
        return JSON.parse(text, JSONfn.reviver);
    }

    static stringify(obj: any): string {
        return JSON.stringify(obj, JSONfn.replacer);
    }

    static reviver(key: string, value: any): any {
        const iso8061 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
        if (typeof value !== "string") return value;
        if (value.length < 8) {
            return value;
        }
        if (value.match(iso8061)) {
            return new Date(value);
        }
        const prefix = value.substring(0, 8);
        if (prefix === "function") {
            return new Function(`return ${value}`)();
        }
        if (prefix === "_NuFrRa_") {
            return new Function(`return ${value.slice(8)}`)();
        }
        if (prefix === "_PxEgEr_") {
            return new Function(`return ${value.slice(8)}`)();
        }
        return value;
    }

    static replacer(key: string, value: any): any {
        if (value instanceof Function || typeof value === "function") {
            const fnBody = value.toString();
            if (fnBody.length < 8 || fnBody.substring(0, 8) !== "function") {
                // this is ES6 Arrow Function
                return "_NuFrRa_" + fnBody;
            }
            return fnBody;
        }
        if (value instanceof RegExp) {
            return "_PxEgEr_" + value;
        }
        return value;
    }
}
