import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

@Pipe({
    name: "join"
})
export class JoinPipe implements PipeTransform {

    transform(value: any, separator: string = ", "): string {
        return (ObjectUtils.isArray(value))
            ? value.join(separator)
            : "";
    }
}
