import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

const emptyValues: any[] = [];

@Pipe({
    standalone: false,
    name: "values"
})
export class ValuesPipe implements PipeTransform {

    transform(value: any): any[] {
        if (!value) return emptyValues;
        return ObjectUtils.isArray(value)
            ? value
            : Object.keys(value).map(key => value[key]);
    }
}
