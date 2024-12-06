import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    standalone: false,
    name: "shift"
})
export class ShiftPipe implements PipeTransform {

    transform(value: any[]): any {
        return !Array.isArray(value) ? null : Array.from(value).shift();
    }
}
