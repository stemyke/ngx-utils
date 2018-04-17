import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

@Pipe({
    name: "max"
})
export class MaxPipe implements PipeTransform {
    transform(value: number[], selector: any = null, params: any = {}): number {
        selector = selector || (item => <number>item);
        const maxSelector: Function = ObjectUtils.isFunction(value) ? value : (item, index, params) => {
            return ObjectUtils.evaluate(selector, {
                item: item,
                index: index,
                params: params
            });
        };
        return ObjectUtils.isArray(value) ? value.max((item, index) => maxSelector(item, index, params)) : 0;
    }
}
