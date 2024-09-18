import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    name: "getValue"
})
export class GetValuePipe implements PipeTransform {

    transform(value: any, path: string, defaultVal: any = ""): any {
        return !value ? value : ObjectUtils.getValue(value, path, defaultVal);
    }
}
