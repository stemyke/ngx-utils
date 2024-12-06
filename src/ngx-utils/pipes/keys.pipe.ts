import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

const emptyKeys: any[] = [];

@Pipe({
    standalone: false,
    name: "keys"
})
export class KeysPipe implements PipeTransform {

    transform(value: any): any[] {
        if (!value) return emptyKeys;
        return ObjectUtils.isArray(value)
            ? Array.from(value.keys())
            : Object.keys(value);
    }
}
