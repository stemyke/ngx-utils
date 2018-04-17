import {Inject, Injectable} from "@angular/core";
import {MathUtils, ObjectUtils} from "../utils";
import {ILanguageService, LANGUAGE_SERVICE} from "../common-types";

@Injectable()
export class FormatterService {

    get defaultPrecision(): number {
        return 2;
    }

    get defaultNumberFormat(): string {
        return `num + ' mm'`;
    }

    get defaultDivider(): number {
        return 1;
    }

    constructor(@Inject(LANGUAGE_SERVICE) public language: ILanguageService) {

    }

    roundNumber(value: number, precision?: number, divider?: number): number {
        return MathUtils.round(value, this.getPrecision(precision), divider || this.defaultDivider);
    }

    formatNumber(value: number | string, format?: string, precision?: number, divider?: number): string {
        precision = this.getPrecision(precision);
        divider = divider || this.defaultDivider;
        const num = ObjectUtils.isNumber(value) ? <number>value : parseFloat(<string>value) || 0;
        const str = (num / divider).toLocaleString(this.language.currentLanguage, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        });
        return ObjectUtils.evaluate(format || this.defaultNumberFormat, {num: str});
    }

    formatMillimeter(value: number, precision?: number, divider?: number): string {
        return this.formatNumber(value, `num + ' mm'`, precision, divider);
    }

    protected getPrecision(precision: number): number {
        return ObjectUtils.isNumber(precision) ? precision : this.defaultPrecision;
    }
}
