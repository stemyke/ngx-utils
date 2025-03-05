import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    standalone: false,
    name: "getType"
})
export class GetTypePipe implements PipeTransform {
    transform(value: any): any {
        return ObjectUtils.getType(value);
    }
}
