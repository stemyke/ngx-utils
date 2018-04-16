import {Injectable} from "@angular/core";
import "rxjs/Rx";
import {ObjectUtils} from "../utils";
import {ILanguageService, ITranslation, ITranslations} from "../common-types";

@Injectable()
export class StaticLanguageService implements ILanguageService {

    currentLanguage: string = "none";
    dictionary: ITranslations = {};

    getTranslation(key: string, params?: any): Promise<string> {
        if (!ObjectUtils.isString(key) || !key.length) {
            throw new Error(`Parameter "key" required`);
        }
        const translation = ObjectUtils.getValue(this.dictionary, key) || key;
        return Promise.resolve(this.interpolate(translation, params));
    }

    getTranslationFromObject(translations: ITranslations, params?: any): string {
        return this.interpolate(translations ? (translations[this.currentLanguage] || "") : "")
    }

    getTranslationFromArray(translations: ITranslation[], params?: any): string {
        const lang = this.currentLanguage;
        const translation = translations ? translations.find(t => t.lang == lang) : null;
        return this.interpolate(translation ? translation.translation : "", params);
    }

    getTranslations(...keys: string[]): Promise<ITranslations> {
        return new Promise<ITranslations>(resolve => {
            Promise.all(keys.map(key => this.getTranslation(key))).then(translations => {
                resolve(keys.reduce((result, key, i) => {
                    result[key] = translations[i];
                    return result;
                }, {}));
            });
        });
    }

    private interpolate(expr: string | Function, params?: any): string {
        if (typeof expr === "string") {
            return this.interpolateString(expr, params);
        }
        if (typeof expr === "function") {
            return expr(params);
        }
        return expr as string;
    }

    private interpolateString(expr: string, params?: any) {
        if (!expr || !params) return expr;
        return expr.replace(/{{\s?([^{}\s]*)\s?}}/g, (substring: string, b: string) => {
            const r = ObjectUtils.getValue(params, b);
            return ObjectUtils.isDefined(r) ? r : substring;
        });
    }
}
