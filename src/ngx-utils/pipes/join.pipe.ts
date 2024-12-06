import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

@Pipe({
    standalone: false,
    name: "join"
})
export class JoinPipe implements PipeTransform {

    transform(value: any, separator: string = ", "): string {
        return (ObjectUtils.isArray(value))
            ? value.join(separator)
            : "";
    }
}
