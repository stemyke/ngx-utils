import {Injectable} from "@angular/core";
import {BehaviorSubject, combineLatest, firstValueFrom, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ILanguageSetting, ILanguageSettings, ITranslations} from "../common-types";
import {StaticLanguageService, EMPTY_DICT} from "./static-language.service";

@Injectable()
export class LanguageService extends StaticLanguageService {

    protected translationRequests: Record<string, Promise<ITranslations>>;
    protected settingsPromise: Promise<ILanguageSettings>;
    protected languageSettings: BehaviorSubject<ILanguageSettings>;

    get currentLanguage(): string {
        return this.currentLang || this.defaultLanguage;
    }

    set currentLanguage(lang: string) {
        this.useLanguage(lang).then(() => {
            this.events.languageChanged.next(lang);
        });
    }

    get settings(): ILanguageSetting {
        const settings = this.languageSettings.value;
        return !settings ? {} : settings.settings[this.currentLanguage] || {};
    }

    get $settings(): Observable<ILanguageSetting> {
        this.loadSettings().then(s => this.languageSettings.next(s));
        return combineLatest([this.languageSettings, this.events.languageChanged]).pipe(map(([settings, lang]) => {
            return !settings ? {} : settings.settings[lang as string] || {};
        }));
    }

    protected initService(): void {
        super.initService();
        this.client.setExtraRequestParam("language", "en");
        this.translationRequests = {};
        this.languageSettings = new BehaviorSubject<ILanguageSettings>(null);
        if (this.universal.isServer) return;
        window["setLanguage"] = (lang: string) => {
            this.currentLanguage = lang;
        };
    }

    async initFromSettings(): Promise<any> {
        const defaultLanguage = this.defaultLanguage;
        const settings = await this.loadSettings();
        this.languageSettings.next(settings);
        const devLanguages = settings.devLanguages || [];
        this.languageList = (settings.languages || []).filter(lang => {
            const unavailable = settings.settings[lang]?.unavailable;
            if (unavailable) {
                const parts = unavailable.split("/");
                const value = parts[0] || parts[1];
                const flags = parts.length > 1 ? parts[parts.length - 1] : "g";
                if (new RegExp(value, flags).test(this.config.baseDomain)) return false;
            }
            return devLanguages.indexOf(lang) < 0;
        });
        if (this.languageList.length === 0) {
            this.languageList = [defaultLanguage];
        }
        const lang = this.selectLanguage(this.currentLang)
            ?? this.selectLanguage(defaultLanguage)
            ?? this.selectLanguage(settings.defaultLanguage || this.languageList[0]);
        await this.useLanguage(lang);
        this.events.languageChanged.next(lang);
    }

    protected selectLanguage(lang: string): string {
        if (!lang) return null;
        return this.languageList.length === 0 || this.languageList.includes(lang)
            ? lang : null;
    }

    protected async useLanguage(lang: string): Promise<ITranslations> {
        lang = this.selectLanguage(lang);
        this.client.setExtraRequestParam("language", lang);
        if (lang === this.currentLang) return this.dictionary;
        this.storage.set("language", lang);
        this.currentLang = lang;
        return this.loadDictionary();
    }

    async getDictionary(lang: string): Promise<ITranslations> {
        if (!lang) return EMPTY_DICT;
        const ext = this.config.translationExt || ``;
        this.translationRequests[lang] = this.translationRequests[lang] || firstValueFrom(this.client.get<ITranslations>(`${this.config.translationUrl}${lang}${ext}`))
            .then(response => {
                response = response || {};
                const dictionary = Object.keys(response).reduce((result, key) => {
                    result[key.toLocaleLowerCase()] = response[key];
                    return result;
                }, {} as ITranslations);
                this.translations[lang] = dictionary;
                this.mergeTranslations();
                return dictionary;
            }).catch(error => {
                console.warn("Translation dictionary problem:", error);
                return EMPTY_DICT;
            })
        return this.translationRequests[lang];
    }

    protected async loadDictionary(): Promise<ITranslations> {
        return this.getDictionary(this.currentLang);
    }

    protected loadSettings(): Promise<ILanguageSettings> {
        const ext = this.config.translationExt || ``;
        this.settingsPromise = this.settingsPromise || firstValueFrom(this.client.get<ILanguageSettings>(`${this.config.translationUrl}languageSettings${ext}`))
            .catch(error => {
                console.warn("Translation settings problem:", error);
                return {
                    languages: ["de", "en", "hu"],
                    devLanguages: [],
                    defaultLanguage: "de",
                    settings: {
                        de: {},
                        hu: {},
                        en: {}
                    }
                };
            });
        return this.settingsPromise;
    }
}
