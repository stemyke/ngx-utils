import {Pipe, PipeTransform} from "@angular/core";
import {FormatterService} from "../services/formatter.service";

@Pipe({
    name: "formatNumber"
})
export class FormatNumberPipe implements PipeTransform {

    constructor(private formatter: FormatterService) {
    }

    transform(value: number, format?: string, precision?: number, divider?: number): string {
        return this.formatter.formatNumber(value, format, precision, divider);
    }
}
