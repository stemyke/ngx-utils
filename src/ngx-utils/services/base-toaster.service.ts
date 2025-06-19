import {Inject, Injectable} from "@angular/core";
import {AsyncMethod, ILanguageService, IToasterService, ToastType} from "../common-types";
import {LANGUAGE_SERVICE} from "../tokens";

@Injectable()
export class BaseToasterService<T = any, P extends Record<string, any> = {}> implements IToasterService {

    protected colorMap: Record<ToastType, string>;

    constructor(@Inject(LANGUAGE_SERVICE) protected language: ILanguageService) {
        this.colorMap = {
            info: "#2F96B4",
            success: "#51A351",
            warning: "#F89406",
            error: "#BD362F"
        };
    }

    info(message: string, params?: P) {
        this.translate(message, params, "info");
    }

    success(message: string, params?: P) {
        this.translate(message, params, "success");
    }

    warning(message: string, params?: P){
        this.translate(message, params, "warning");
    }

    error(message: string, params?: P) {
        this.translate(message, params, "error");
    }

    infoPromised(message: string, params?: P) {
        return this.translatePromised(message, params, "info");
    }

    successPromised(message: string, params?: P) {
        return this.translatePromised(message, params, "success");
    }

    warningPromised(message: string, params?: P) {
        return this.translatePromised(message, params, "warning");
    }

    errorPromised(message: string, params?: P) {
        return this.translatePromised(message, params, "error");
    }

    handleAsyncMethod(method: AsyncMethod): void {
        if (!method) return;
        method().then(result => {
            if (result) {
                this.success(result.message, result.context);
            }
        }, reason => {
            if (!reason || !reason.message)
                throw new Error("Reason must implement IAsyncMessage interface");
            this.error(reason.message, reason.context);
        });
    }

    protected translate(message: string, params: P, type: ToastType): void {
        this.language.getTranslation(message, params).then(str => {
            this.show(str, type, params);
        });
    }

    protected async translatePromised(message: string, params: P, type: ToastType): Promise<T> {
        const str = await this.language.getTranslation(message, params);
        return this.show(str, type, params);
    }

    protected show(message: string, type: ToastType, params: P): T | Promise<T> {
        console.log(message, `background: ${this.colorMap[type]}; color: #ffffff`, params);
        return null;
    }
}
