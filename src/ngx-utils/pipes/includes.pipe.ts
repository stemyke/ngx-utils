import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export function defaultFilter() {
    return true;
}

@Pipe({
    standalone: false,
    name: "includes"
})
export class IncludesPipe implements PipeTransform {
    transform(array: any, ...values: any[]): boolean {
        return ObjectUtils.isArray(array) && values.some(v => array.includes(v));
    }
}
