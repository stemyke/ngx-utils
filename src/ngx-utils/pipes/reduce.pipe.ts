import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultReducer(result) {
    return result;
}

@Pipe({
    standalone: false,
    name: "reduce"
})
export class ReducePipe implements PipeTransform {
    transform(values: any[], source: any, reducer: any = defaultReducer, params: any = {}): any {
        if (!ObjectUtils.isArray(values)) return [];
        const mapperFunc = ObjectUtils.isFunction(reducer) ? reducer : (result, value, index, params) => {
            return ObjectUtils.evaluate(reducer, {
                result: result,
                value: value,
                index: index,
                params: params
            });
        };
        return values.reduce((result, value, index) => mapperFunc(result, value, index, params), source);
    }
}
