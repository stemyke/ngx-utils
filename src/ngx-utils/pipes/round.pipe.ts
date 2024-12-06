import {Pipe, PipeTransform} from "@angular/core";
import {FormatterService} from "../services/formatter.service";

@Pipe({
    standalone: false,
    name: "round"
})
export class RoundPipe implements PipeTransform {

    constructor(private formatter: FormatterService) {
    }

    transform(value: number, precision: number = 2, divider: number = 1): number {
        return this.formatter.roundNumber(value, precision, divider);
    }
}
