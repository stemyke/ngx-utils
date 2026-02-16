import {isObservable} from "rxjs";

export type JsonReplacer = (key: string, value: any) => any;

const iso8061 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:.\d+)?(?:Z|[+-]\d\d:\d\d)$/;

function serializer(replacer: JsonReplacer, cycleReplacer: JsonReplacer): JsonReplacer {
    const stack: any[] = [], keys = []

    if (cycleReplacer == null) cycleReplacer = function(key, value) {
        if (stack[0] === value) return "[Circular ~]"
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    }

    return (key, value) => {
        if (isObservable(value)) return "[Observable ~]";
        if (stack.length > 0) {
            const thisPos = stack.indexOf(this)
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
            if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
        }
        else stack.push(value)

        if (typeof value === "string" && value.match(iso8061)) {
            value = new Date(value);
        }

        return replacer == null ? value : replacer.call(this, key, value)
    }
}

export function stringify(value: any, replacer: JsonReplacer = null, spaces: number = 2, cycleReplacer: JsonReplacer = null) {
    return JSON.stringify(value, serializer(replacer, cycleReplacer), spaces)
}
