import {Inject, Injectable, Pipe, PipeTransform} from "@angular/core";
import {ILanguageService, ITranslation, ITranslations, LANGUAGE_SERVICE} from "../services/language.service";
import {ObjectUtils} from "../utils";

export type TranslationQuery = string | ITranslations | ITranslation[];

@Injectable()
@Pipe({
    name: "translation",
    pure: false
})
export class TranslationPipe implements PipeTransform {

    private lang: string;
    private query: TranslationQuery;
    private args: any[];
    private params: any;
    private lastValue: string;

    constructor(@Inject(LANGUAGE_SERVICE) private language: ILanguageService) {

    }

    transform(query: TranslationQuery, ...args: any[]): string {
        if (!query) return "";
        let dirty = false;
        if (this.lang !== this.language.currentLanguage) {
            this.lang = this.language.currentLanguage;
            dirty = true;
        }
        if(!ObjectUtils.equals(this.query, query)) {
            this.query = query;
            dirty = true;
        }
        if (!ObjectUtils.equals(this.args, args)) {
            this.args = args;
            this.params = null;
            if(ObjectUtils.isDefined(args[0]) && args.length) {
                if(typeof args[0] === "string" && args[0].length) {
                    const validArgs: string = args[0]
                        .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, `"$2":`)
                        .replace(/:(\s)?(\')(.*?)(\')/g, `:"$3"`);
                    try {
                        this.params = JSON.parse(validArgs);
                    } catch(e) {
                        throw new SyntaxError(`Wrong parameter in TranslatePipe. Expected a valid Object, received: ${args[0]}`);
                    }
                } else if(typeof args[0] === "object" && !Array.isArray(args[0])) {
                    this.params = args[0];
                }
            }
            dirty = true;
        }
        if (dirty) {
            if (typeof query === "object") {
                this.lastValue = Array.isArray(query) ? this.language.getTranslationFromArray(query, this.params) : this.language.getTranslationFromObject(query, this.params);
                return this.lastValue;
            }
            this.language.getTranslation(query, this.params).then(value => this.lastValue = value);
        }
        return this.lastValue;
    }
}
