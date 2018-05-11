import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    name: "filter"
})
export class FilterPipe implements PipeTransform {
    transform(values: any, filter: any = defaultFilter, params: any = {}): any[] {
        if (!ObjectUtils.isObject(values)) return [];
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, key, params) => {
            return ObjectUtils.evaluate(filter, {
                value: value,
                key: key,
                item: value,
                index: key,
                params: params
            });
        };
        return ObjectUtils.filter(values, (value, key) => {
            return filterFunc(value, key, params);
        });
    }
}
