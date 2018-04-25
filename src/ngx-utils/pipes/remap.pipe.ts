import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

const empty: any = {};

@Pipe({
    name: "remap"
})
export class RemapPipe implements PipeTransform {

    transform(source: any, map: any): any {
        if (!source) return empty;
        if (!map) return source;
        return ObjectUtils.filter(source, (value, key, target) => {
            if (ObjectUtils.isArray(value) && value.every(ObjectUtils.isString)) {
                target[key] = value.reduce((result, k) => {
                    result[k] = ObjectUtils.getValue(map, k);
                    return result;
                }, {});
                return false;
            }
            return true;
        });
    }
}
