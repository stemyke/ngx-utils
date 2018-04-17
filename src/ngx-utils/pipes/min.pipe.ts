import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

@Pipe({
    name: "min"
})
export class MinPipe implements PipeTransform {
    transform(value: number[], selector: any = null, params: any = {}): number {
        selector = selector || (item => <number>item);
        const minSelector: Function = ObjectUtils.isFunction(value) ? value : (item, index, params) => {
            return ObjectUtils.evaluate(selector, {
                item: item,
                index: index,
                params: params
            });
        };
        return ObjectUtils.isArray(value) ? value.min((item, index) => minSelector(item, index, params)) : 0;
    }
}
