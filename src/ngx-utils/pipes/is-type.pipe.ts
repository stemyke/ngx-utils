import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    standalone: false,
    name: "isType"
})
export class IsTypePipe implements PipeTransform {
    transform(value: any, type: string): any {
        return ObjectUtils.getType(value) === type;
    }
}
