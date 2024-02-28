import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    name: "find"
})
export class FindPipe implements PipeTransform {
    transform(values: any[], filter: any = defaultFilter, params?: any): any {
        if (!ObjectUtils.isArray(values)) return [];
        params = params || {};
        if (ObjectUtils.isObject(params)) {
            params.values = values;
        }
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, index, params, values) => {
            return ObjectUtils.evaluate(filter, {value, index, params, values});
        };
        return values.find((value, index) => filterFunc(value, index, params, values));
    }
}
