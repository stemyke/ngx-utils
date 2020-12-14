import {Injectable} from "@angular/core";
import {ILanguageService, ITranslation, ITranslations} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {EventsService} from "./events.service";

@Injectable()
export class StaticLanguageService implements ILanguageService {

    get defaultLanguage(): string {
        return "none";
    }

    get dictionary(): any {
        return this.translations[this.currentLanguage];
    }

    set dictionary(value: any) {
        this.translations[this.currentLanguage] = value;
    }

    get currentLanguage(): string {
        return this.currentLang;
    }

    set currentLanguage(lang: string) {
        this.currentLang = lang;
        this.events.languageChanged.emit(lang);
    }

    get editLanguage(): string {
        return this.editLang || this.currentLanguage;
    }

    set editLanguage(lang: string) {
        this.editLang = lang || this.currentLanguage;
    }

    get disableTranslations(): boolean {
        return this.disableTrans;
    }

    set disableTranslations(value: boolean) {
        this.disableTrans = value;
        this.events.languageChanged.emit(this.currentLang);
    }

    private editLang: string;
    private currentLang: string;
    private disableTrans: boolean;
    private readonly translations: ITranslations;

    constructor(readonly events: EventsService) {
        this.editLang = null;
        this.currentLang = "none";
        this.disableTrans = false;
        this.translations = {
            none: {}
        };
    }

    addLanguages(languages: string[]): void {
        languages.forEach(lang => {
            this.translations[lang] = {};
        });
    }

    getTranslationSync(key: string, params: any = null): string {
        const lowerKey = (key || "").toLocaleLowerCase();
        const translation = this.dictionary[lowerKey] || lowerKey;
        return this.interpolate(translation == lowerKey ? key : translation, params);
    }

    getTranslation(key: string, params?: any): Promise<string> {
        if (!ObjectUtils.isString(key) || !key.length) {
            throw new Error(`Parameter "key" required`);
        }
        const translation = ObjectUtils.getValue(this.dictionary, key, key) || key;
        return Promise.resolve(this.interpolate(translation, params));
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

    getTranslationFromObject(translations: ITranslations, params?: any, lang?: string): string {
        lang = lang || this.currentLanguage;
        return this.interpolate(translations ? (translations[lang] || "") : "")
    }

    getTranslationFromArray(translations: ITranslation[], params?: any, lang?: string): string {
        lang = lang || this.currentLanguage;
        const translation = translations ? translations.find(t => t.lang == lang) : null;
        return this.interpolate(translation ? translation.translation : "", params);
    }

    protected interpolate(expr: string | Function, params?: any): string {
        if (typeof expr === "string") {
            return this.interpolateString(expr, params);
        }
        if (typeof expr === "function") {
            return expr(params);
        }
        return expr as string;
    }

    protected interpolateString(expr: string, params?: any) {
        if (!expr || !params) return expr;
        return expr.replace(/{{\s?([^{}\s]*)\s?}}/g, (substring: string, b: string) => {
            const r = ObjectUtils.getValue(params, b);
            return ObjectUtils.isDefined(r) ? r : substring;
        });
    }
}
