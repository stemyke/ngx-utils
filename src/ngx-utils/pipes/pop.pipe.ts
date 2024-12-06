import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    standalone: false,
    name: "pop"
})
export class PopPipe implements PipeTransform {

    transform(value: any[]): any {
        return !Array.isArray(value) ? null : Array.from(value).pop();
    }
}
