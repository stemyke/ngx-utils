import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    standalone: false,
    name: "getType"
})
export class GetTypePipe implements PipeTransform {
    transform(value: any): any {
        return typeof value;
    }
}
