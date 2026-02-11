import {Inject, Injectable} from "@angular/core";
import {
    CONFIG_SERVICE, GlobalTranslations,
    IConfigService,
    IConfiguration,
    ILanguageService,
    IPromiseService,
    ITranslation,
    ITranslations,
    PROMISE_SERVICE
} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {EventsService} from "./events.service";
import {StorageService} from "./storage.service";
import {UniversalService} from "./universal.service";
import {BaseHttpClient} from "./base-http.client";
import {HttpClient} from "@angular/common/http";

const emptyDict: ITranslations = {};

@Injectable()
export class StaticLanguageService implements ILanguageService {

    get defaultLanguage(): string {
        return this.configs.getQueryParameter("lang") || this.storage.get("language", this.getDefaultLanguage());
    }

    get dictionary(): ITranslations {
        return this.mergedTranslations[this.currentLanguage] || emptyDict;
    }

    set dictionary(value: ITranslations) {
        this.translations[this.currentLanguage] = value;
        this.mergeTranslations();
    }

    get languages(): ReadonlyArray<string> {
        return this.languageList;
    }

    get currentLanguage(): string {
        return this.currentLang || this.defaultLanguage;
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
        this.events.editLanguageChanged.emit(this.editLang);
    }

    get disableTranslations(): boolean {
        return this.disableTrans;
    }

    set disableTranslations(value: boolean) {
        this.disableTrans = value;
        this.events.languageChanged.emit(this.currentLang);
    }

    get httpClient(): HttpClient {
        return this.client;
    }

    get config(): IConfiguration {
        return this.configs.config;
    }

    get universal(): UniversalService {
        return this.storage.universal;
    }

    protected editLang: string;
    protected currentLang: string;
    protected disableTrans: boolean;
    protected languageList: string[];
    protected readonly translations: GlobalTranslations;
    protected overrideTranslations: GlobalTranslations;
    protected mergedTranslations: GlobalTranslations;

    constructor(@Inject(EventsService) readonly events: EventsService,
                @Inject(StorageService) readonly storage: StorageService,
                @Inject(CONFIG_SERVICE) readonly configs: IConfigService,
                @Inject(PROMISE_SERVICE) protected promises: IPromiseService,
                @Inject(BaseHttpClient) protected client: BaseHttpClient) {
        this.editLang = null;
        this.currentLang = null;
        this.disableTrans = false;
        this.languageList = [];
        this.translations = {
            none: {}
        };
        this.overrideTranslations = {
            none: {}
        };
        this.mergedTranslations = this.translations;
        this.initService();
    }

    protected initService(): void {

    }

    replaceLanguages(languages: string[]): void {
        languages = Array.isArray(languages) && languages.length > 0 ? languages : this.languageList;
        this.languageList = Array.from(new Set<string>(languages));
        this.languageList.forEach(lang => {
            this.translations[lang] = this.translations[lang] || emptyDict;
        });
    }

    addLanguages(languages: string[]): void {
        if (!Array.isArray(languages) || languages.length == 0) return;
        this.replaceLanguages(this.languageList.concat(languages));
    }

    setOverrideTranslations(translations: GlobalTranslations): void {
        if (ObjectUtils.isObject(translations)) {
            this.overrideTranslations = translations;
            this.mergeTranslations();
            return;
        }
        this.overrideTranslations = {};
        this.mergedTranslations = this.translations;
    }

    getTranslationSync(key: string, params: any = null): string {
        key = String(key || "");
        const lowerKey = key.toLocaleLowerCase();
        const translation = !key ? "" : this.dictionary[lowerKey] || key;
        return this.interpolate(translation, params);
    }

    async getTranslation(key: string, params?: any): Promise<string> {
        return this.getTranslationSync(key, params);
    }

    getTranslations(...keys: string[]): Promise<ITranslations> {
        return this.promises.create<ITranslations>(resolve => {
            this.promises.all(keys.map(key => this.getTranslation(key))).then(translations => {
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

    protected getDefaultLanguage(): string {
        if (!this.universal.isBrowser || typeof window.navigator === "undefined") {
            return "de";
        }
        let browserLang: string = (window.navigator.languages ? window.navigator.languages[0] : null)
            || window.navigator.language || window.navigator["browserLanguage"] || window.navigator["userLanguage"] || null;
        if (!browserLang) return browserLang;

        ["-", "_"].forEach(splitter => {
            if (browserLang.indexOf(splitter) >= 0) {
                browserLang = browserLang.split(splitter)[0];
            }
        })
        return browserLang;
    }

    protected mergeTranslations(): void {
        const languages = new Set([
            ...Object.keys(this.translations),
            ...Object.keys(this.overrideTranslations)
        ]);
        this.mergedTranslations = Array.from(languages).reduce((merged, language) => {
            merged[language] = {
                ...(this.translations[language] || emptyDict),
                ...(this.overrideTranslations[language] || emptyDict),
            };
            return merged;
        }, {} as GlobalTranslations);
    }
}
