import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

export interface IExtraProperties {
    [prop: string]: any;
}

@Pipe({
    name: "extraItemProperties"
})
export class ExtraItemPropertiesPipe implements PipeTransform {
    transform(items: any[], properties: IExtraProperties, params: any = {}): any[] {
        const keys = Object.keys(properties);
        keys.forEach(key => {
            const value = properties[key];
            properties[key] = ObjectUtils.isFunction(value) ? value : (item, index, params) => {
                return ObjectUtils.evaluate(value, {
                    item: item,
                    index: index,
                    params: params
                });
            };
        });
        return (items || []).map((item, index) => keys.reduce((result, key) => {
            result[key] = properties[key](item, index, params);
            return result;
        }, {...item}));
    }
}
