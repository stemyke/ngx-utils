import {Inject, Injectable} from "@angular/core";
import {ILanguageService, IToasterService, LANGUAGE_SERVICE} from "../common-types";

@Injectable()
export class ConsoleToasterService implements IToasterService {

    constructor(@Inject(LANGUAGE_SERVICE) private language: ILanguageService) {

    }

    error(message: string, params?: any, title?: string): void {
        this.translateMessage(message, params, str => console.log(str, title, "background: #BD362F; color: #ffffff"));
    }

    info(message: string, params?: any, title?: string): void {
        this.translateMessage(message, params, str => console.log(str, title, "background: #2F96B4; color: #ffffff"));
    }

    success(message: string, params?: any, title?: string): void {
        this.translateMessage(message, params, str => console.log(str, title, "background: #51A351; color: #ffffff"));
    }

    warning(message: string, params?: any, title?: string): void {
        this.translateMessage(message, params, str => console.log(str, title, "background: #F89406; color: #ffffff"));
    }

    private translateMessage(message: string, params: any, callback: (message: string) => void): void {
        this.language.getTranslation(message, params).then(callback);
    }
}
