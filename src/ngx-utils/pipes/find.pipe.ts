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
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (value, index, params) => {
            return ObjectUtils.evaluate(filter, {
                value: value,
                index: index,
                params: params
            });
        };
        return values.find((value, index) => filterFunc(value, index, params));
    }
}
