import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    standalone: false,
    name: "isType"
})
export class IsTypePipe implements PipeTransform {
    transform(value: any, type: string): any {
        return (typeof value) === type;
    }
}
