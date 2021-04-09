import {Injectable} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ILanguageSettings, ITranslations} from "../common-types";
import {StaticLanguageService} from "./static-language.service";

@Injectable()
export class LanguageService extends StaticLanguageService {

    protected translationRequests: ITranslations;
    protected settingsPromise: Promise<ILanguageSettings>;
    protected languageSettings: BehaviorSubject<ILanguageSettings>;

    get currentLanguage(): string {
        return this.currentLang || this.defaultLanguage;
    }

    set currentLanguage(lang: string) {
        this.useLanguage(lang).then(() => {
            this.events.languageChanged.emit(lang);
        });
    }

    get settings(): ILanguageSettings {
        const settings = this.languageSettings.value;
        return !settings ? {} : settings.settings[this.currentLanguage] || {};
    }

    get $settings(): Observable<any> {
        this.loadSettings().then(s => this.languageSettings.next(s));
        return combineLatest([this.languageSettings, this.events.languageChanged]).pipe(map(([settings, lang]) => {
            return !settings ? {} : settings.settings[lang as string] || {};
        }));
    }

    protected initService(): void {
        this.client.setExtraRequestParam("language", "de");
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
            return devLanguages.indexOf(lang) < 0;
        });
        const lang = this.languages.indexOf(defaultLanguage) < 0 ? settings.defaultLanguage : defaultLanguage;
        await this.useLanguage(lang);
        this.events.languageChanged.emit(lang);
    }

    async getTranslation(key: string, params: any = null): Promise<string> {
        if (!key) return "";
        try {
            const lowerKey = key.toLocaleLowerCase();
            const dict = await this.loadDictionary();
            if (lowerKey in dict) {
                return this.interpolate(dict[lowerKey], params);
            }
            return this.interpolate(key, params);
        } catch (reason) {
            console.log("ERROR IN TRANSLATIONS", reason);
            return key;
        }
    }

    protected async useLanguage(lang: string): Promise<ITranslations> {
        lang = this.languages.indexOf(lang) < 0 ? this.languages[0] : lang;
        this.client.setExtraRequestParam("language", lang);
        if (lang == this.currentLang) return this.dictionary;
        this.storage.set("language", lang);
        this.currentLang = lang;
        const dict = await this.loadDictionary();
        this.translations[lang] = dict;
        return dict;
    }

    protected loadDictionary(): Promise<any> {
        const lang = this.currentLanguage;
        this.translationRequests[lang] = this.translationRequests[lang] || new Promise(resolve => {
            this.httpClient.get(`${this.config.translationUrl}${lang}`).toPromise().then(response => {
                response = response || {};
                resolve(Object.keys(response).reduce((result, key) => {
                    result[key.toLocaleLowerCase()] = response[key];
                    return result;
                }, {}));
            }, () => {
                resolve({});
            });
        });
        return this.translationRequests[lang];
    }

    protected loadSettings(): Promise<ILanguageSettings> {
        this.settingsPromise = this.settingsPromise || this.client.get(`${this.config.translationUrl}languageSettings`).toPromise()
            .then(
                (settings: ILanguageSettings) => {
                    return settings;
                }, () => {
                    return {
                        languages: ["de", "en", "hu"],
                        devLanguages: [],
                        defaultLanguage: "de",
                        settings: {
                            de: {},
                            hu: {},
                            end: {}
                        }
                    };
                }
            );
        return this.settingsPromise;
    }
}
