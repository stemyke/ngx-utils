import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";
import {ArrayUtils} from "../utils/array.utils";

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
        return ArrayUtils.min(value, (item, index) => minSelector(item, index, params));
    }
}
