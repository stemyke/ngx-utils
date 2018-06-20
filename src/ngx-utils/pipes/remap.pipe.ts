import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

const empty: any = {};

@Pipe({
    name: "remap"
})
export class RemapPipe implements PipeTransform {

    transform(map: any, source: any, defaultValue: string = "key"): any {
        if (!map) return empty;
        if (!source) return map;
        const remapped = ObjectUtils.filter({map: ObjectUtils.copy(map)}, (value, key, target) => {
            if (ObjectUtils.isArray(value) && value.every(ObjectUtils.isString)) {
                target[key] = value.reduce((result, k) => {
                    result[k] = ObjectUtils.getValue(source, k, ObjectUtils.evaluate(defaultValue, {key: k, map: map, source: source}));
                    return result;
                }, {});
                return false;
            }
            return true;
        });
        return remapped.map;
    }
}
