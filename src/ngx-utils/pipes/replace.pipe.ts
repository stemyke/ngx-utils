import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "replace"
})
export class ReplacePipe implements PipeTransform {

    transform(value: string, from: string | RegExp, to: string): string {
        return value ? value.replace(from, to) : value;
    }
}
