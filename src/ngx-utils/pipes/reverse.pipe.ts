import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils";

const emptyArray: any[] = [];

@Pipe({
    name: "reverse"
})
export class ReversePipe implements PipeTransform {

    transform(value: any[]): any[] {
        if (!ObjectUtils.isArray(value)) return emptyArray;
        const result = [];
        for (let i = value.length - 1; i >= 0; i--) {
            result.push(value[i]);
        }
        return result;
    }
}
