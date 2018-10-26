import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    name: "filter"
})
export class FilterPipe implements PipeTransform {
    transform(values: any, filter: any = defaultFilter, params: any = {}): any {
        const isObject = ObjectUtils.isObject(values);
        if (!isObject && !ObjectUtils.isArray(values)) return [];
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, key, params) => {
            return ObjectUtils.evaluate(filter, {
                value: value,
                key: key,
                item: value,
                index: key,
                params: params
            });
        };
        if (isObject) {
            return Object.keys(values).filter(key => {
                return filterFunc(values[key], key, params);
            }).reduce((result, key) => {
                result[key] = values[key];
                return result;
            }, {})
        }
        return values.filter((value, key) => {
            return filterFunc(value, key, params);
        });
    }
}
