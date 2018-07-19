import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultMapper(item) {
    return item;
}

@Pipe({
    name: "map"
})
export class MapPipe implements PipeTransform {
    transform(values: any[], mapper: any = defaultMapper, params: any = {}): any[] {
        if (!ObjectUtils.isArray(values)) return [];
        const mapperFunc = ObjectUtils.isFunction(mapper) ? mapper : (value, index, params) => {
            return ObjectUtils.evaluate(mapper, {
                value: value,
                index: index,
                params: params
            });
        };
        return values.map((value, index) => mapperFunc(value, index, params));
    }
}
