import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

export const defaultFilter = () => true;

@Pipe({
    name: "filter"
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], filter: any = defaultFilter, params: any = {}): any[] {
        const filterFunc = ObjectUtils.isFunction(filter) ? filter : (item, index, params) => {
            return ObjectUtils.evaluate(filter, {
                item: item,
                index: index,
                params: params
            });
        };
        return (items || []).filter((item, index) => {
            return filterFunc(item, index, params);
        });
    }
}
