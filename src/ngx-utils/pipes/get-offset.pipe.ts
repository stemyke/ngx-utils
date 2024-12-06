import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    standalone: false,
    name: "getOffset"
})
export class GetOffsetPipe implements PipeTransform {
    transform(value: any, offset: any): any {
        return value ? (ObjectUtils.isNullOrUndefined(offset) ? value : value[offset]) : null;
    }
}
