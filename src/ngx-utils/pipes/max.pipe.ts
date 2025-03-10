import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";
import {ArrayUtils} from "../utils/array.utils";

@Pipe({
    standalone: false,
    name: "max"
})
export class MaxPipe implements PipeTransform {
    transform(value: any[], selector: any = null, params: any = {}): number {
        selector = selector || (item => <number>item);
        const maxSelector: Function = ObjectUtils.isFunction(value) ? value : (item, index, params) => {
            return ObjectUtils.evaluate(selector, {
                item: item,
                index: index,
                params: params
            });
        };
        return ArrayUtils.max(value, (item, index) => maxSelector(item, index, params));
    }
}
