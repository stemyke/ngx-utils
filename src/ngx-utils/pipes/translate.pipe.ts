import {ChangeDetectorRef, Inject, Injectable, Pipe, PipeTransform} from "@angular/core";
import {ILanguageService, LANGUAGE_SERVICE, TranslationQuery} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";

@Injectable()
@Pipe({
    name: "translate",
    pure: false
})
export class TranslatePipe implements PipeTransform {

    private lang: string;
    private disabled: boolean;
    private query: TranslationQuery;
    private args: any[];
    private params: any;
    private lastValue: string;

    get currentLang(): string {
        return this.language.currentLanguage
    }

    constructor(readonly cdr: ChangeDetectorRef, @Inject(LANGUAGE_SERVICE) readonly language: ILanguageService) {

    }

    transform(query: TranslationQuery, ...args: any[]): string {
        if (!query) return "";
        let dirty = false;
        const lang = this.currentLang;
        if (this.lang !== lang) {
            this.lang = lang;
            dirty = true;
        }
        const disabled = this.language.disableTranslations;
        if (this.disabled !== disabled) {
            this.disabled = disabled;
            dirty = true;
        }
        if (!ObjectUtils.equals(this.query, query)) {
            this.query = query;
            dirty = true;
        }
        if (!ObjectUtils.equals(this.args, args)) {
            this.args = args;
            this.params = null;
            if (ObjectUtils.isDefined(args[0]) && args.length) {
                if (typeof args[0] === "string" && args[0].length) {
                    const validArgs: string = args[0]
                        .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, `"$2":`)
                        .replace(/:(\s)?(\')(.*?)(\')/g, `:"$3"`);
                    try {
                        this.params = JSON.parse(validArgs);
                    } catch (e) {
                        throw new SyntaxError(`Wrong parameter in TranslatePipe. Expected a valid Object, received: ${args[0]}`);
                    }
                } else if (typeof args[0] === "object" && !Array.isArray(args[0])) {
                    this.params = args[0];
                }
            }
            dirty = true;
        }
        if (dirty) {
            if (typeof query === "object") {
                this.lastValue = Array.isArray(query) ? this.language.getTranslationFromArray(query, this.params, lang) : this.language.getTranslationFromObject(query, this.params, lang);
                return this.lastValue;
            }
            if (this.disabled) {
                this.lastValue = query;
                return this.lastValue;
            }
            this.language.getTranslation(query, this.params).then(value => {
                this.lastValue = value;
                this.cdr.detectChanges();
            });
        }
        return this.lastValue;
    }
}
