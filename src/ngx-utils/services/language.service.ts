import {Injectable} from "@angular/core";
import {BehaviorSubject, combineLatest, firstValueFrom, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ILanguageSetting, ILanguageSettings, ITranslations} from "../common-types";
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
        const lang = this.languages.indexOf(defaultLanguage) < 0 ? settings.defaultLanguage || this.languageList[0] : defaultLanguage;
        await this.useLanguage(lang);
        this.events.languageChanged.emit(lang);
    }

    protected async useLanguage(lang: string): Promise<ITranslations> {
        lang = this.languages.indexOf(lang) < 0 ? this.languages[0] : lang;
        this.client.setExtraRequestParam("language", lang);
        if (lang == this.currentLang) return this.dictionary;
        this.storage.set("language", lang);
        this.currentLang = lang;
        return this.loadDictionary();
    }

    protected loadDictionary(): Promise<ITranslations> {
        const lang = this.currentLanguage;
        this.translationRequests[lang] = this.translationRequests[lang] || new Promise(resolve => {
            const ext = this.config.translationExt || ``;
            const request = this.httpClient.get(`${this.config.translationUrl}${lang}${ext}`);
            firstValueFrom(request).then(response => {
                resolve(this.setDictionary(lang, response));
            }, reason => {
                console.warn("ERROR IN TRANSLATIONS", reason);
                resolve(this.setDictionary(lang, {}));
            });
        });
        return this.translationRequests[lang];
    }

    protected loadSettings(): Promise<ILanguageSettings> {
        const ext = this.config.translationExt || ``;
        this.settingsPromise = this.settingsPromise || (this.client.get(`${this.config.translationUrl}languageSettings${ext}`).toPromise())
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
                            en: {}
                        }
                    };
                }
            );
        return this.settingsPromise;
    }
}
