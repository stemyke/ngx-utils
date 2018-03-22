import {InjectionToken} from "@angular/core";
import {Injectable} from "@angular/core";
import "rxjs/Rx";
import {ObjectUtils} from "../utils";

export const LANGUAGE_SERVICE: InjectionToken<ILanguageService> = new InjectionToken<ILanguageService>("language-service");

export interface ITranslation {
    lang: string;
    translation: string;
}

export interface ITranslations {
    [key: string]: string;
}

export interface ILanguageService {
    currentLanguage: string;
    getTranslation(key: string, params?: any): Promise<string>;
    getTranslationFromObject(translations: ITranslations, params?: any): string;
    getTranslationFromArray(translations: ITranslation[], params?: any): string;
    getTranslations(...keys: string[]): Promise<ITranslations>;
}

@Injectable()
export class StaticLanguageService implements ILanguageService {

    currentLanguage: string = "none";
    dictionary: ITranslations = {};

    getTranslation(key: string, params?: any): Promise<string> {
        if (!ObjectUtils.isDefined(key) || !key.length) {
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
