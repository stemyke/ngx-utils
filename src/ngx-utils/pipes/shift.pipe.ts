import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "shift"
})
export class ShiftPipe implements PipeTransform {

    transform(value: any[]): any {
        return !Array.isArray(value) ? null : Array.from(value).shift();
    }
}
