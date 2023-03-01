import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    name: "replace"
})
export class ReplacePipe implements PipeTransform {
    transform(value: string, from: string | RegExp, to: string): string {
        return ObjectUtils.isDefined(value) ? `${value}`.replace(from, to) : ``;
    }
}
