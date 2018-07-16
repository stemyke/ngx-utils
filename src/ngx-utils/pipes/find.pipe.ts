import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    name: "find"
})
export class FindPipe implements PipeTransform {
    transform(values: any[], filter: any = defaultFilter, params: any = {}): any[] {
        if (!ObjectUtils.isArray(values)) return [];
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, key, params) => {
            return ObjectUtils.evaluate(filter, {
                value: value,
                key: key,
                item: value,
                index: key,
                params: params
            });
        };
        return values.find((value, key) => filterFunc(value, key, params));
    }
}
