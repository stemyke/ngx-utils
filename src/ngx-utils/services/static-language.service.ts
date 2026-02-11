import {Inject, Injectable} from "@angular/core";
import {
    GlobalTranslations,
    IConfigService,
    IConfiguration,
    ILanguageService,
    IPromiseService,
    ITranslation,
    ITranslations
} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {EventsService} from "./events.service";
import {StorageService} from "./storage.service";
import {UniversalService} from "./universal.service";
import {BaseHttpClient} from "./base-http.client";
import {HttpClient} from "@angular/common/http";
import {CONFIG_SERVICE, PROMISE_SERVICE} from "../tokens";

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
        this.setDictionary(this.currentLang, value);
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
        this.events.languageChanged.next(lang);
    }

    get editLanguage(): string {
        return this.editLang || this.currentLanguage;
    }

    set editLanguage(lang: string) {
        this.editLang = lang || this.currentLanguage;
        this.events.editLanguageChanged.next(this.editLang);
    }

    get enableTranslations(): boolean {
        return this.enableTrans;
    }

    set enableTranslations(value: boolean) {
        this.enableTrans = value;
        this.events.translationsEnabled.next(value);
    }

    get disableTranslations(): boolean {
        return !this.enableTranslations;
    }

    set disableTranslations(value: boolean) {
        this.enableTranslations = !value;
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
    protected enableTrans: boolean;
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
        this.enableTrans = true;
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

    getTranslationSync(key: string, params: Object = null): string {
        key = String(key ?? "");
        if (!key) return "";
        try {
            const lowerKey = key.toLocaleLowerCase();
            const dict = this.dictionary;
            if (lowerKey in dict && this.enableTranslations) {
                return this.interpolate(dict[lowerKey], params);
            }
            return this.interpolate(key, params);
        } catch (reason) {
            console.warn("ERROR IN TRANSLATIONS", reason);
            return key;
        }
    }

    async getTranslation(key: string, params: any = null): Promise<string> {
        await this.loadDictionary();
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

    protected async loadDictionary(): Promise<ITranslations> {
        return this.dictionary;
    }

    protected setDictionary(lang: string, dictionary: ITranslations): ITranslations {
        this.translations[lang] = Object.keys(dictionary || {}).reduce((res, key) => {
            res[key.toLocaleLowerCase()] = dictionary[key];
            return res;
        }, {} as ITranslations);
        return this.translations[lang];
    }

    protected interpolate(expr: string | Function, params?: Object): string {
        if (typeof expr === "string") {
            return this.interpolateString(expr, params);
        }
        if (typeof expr === "function") {
            return expr(params);
        }
        return expr as string;
    }

    protected interpolateString(expr: string, params?: Object) {
        if (!expr || !params) return expr;
        return expr.replace(/{{\s?([^{}\s]*)\s?}}/g, (substring: string, b: string) => {
            const r = ObjectUtils.getValue(params, b, "");
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
