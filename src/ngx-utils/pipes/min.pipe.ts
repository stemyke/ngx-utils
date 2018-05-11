import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    name: "min"
})
export class MinPipe implements PipeTransform {
    transform(value: any, selector: any = null, params: any = {}): number {
        selector = selector || (item => <number>item);
        const minSelector: Function = ObjectUtils.isFunction(value) ? value : (item, index, params) => {
            return ObjectUtils.evaluate(selector, {
                item: item,
                index: index,
                params: params
            });
        };
        const isArray: boolean = ObjectUtils.isArray(value);
        return isArray ? value.min((item, index) => minSelector(item, index, params)) : 0;
    }
}
