import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    standalone: false,
    name: "filter"
})
export class FilterPipe implements PipeTransform {
    transform(values: any, filter: any = defaultFilter, params: any = {}): any {
        const isObject = ObjectUtils.isObject(values);
        if (!isObject && !ObjectUtils.isArray(values)) return [];
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, key, params, values) => {
            const index = key;
            return ObjectUtils.evaluate(filter, {value, key, params, values, index});
        };
        if (isObject) {
            return Object.keys(values).filter(key => {
                return filterFunc(values[key], key, params, values);
            }).reduce((result, key) => {
                result[key] = values[key];
                return result;
            }, {})
        }
        return values.filter((value, key) => {
            return filterFunc(value, key, params, values);
        });
    }
}
