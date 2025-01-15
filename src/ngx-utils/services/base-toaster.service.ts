import {Inject, Injectable} from "@angular/core";
import {AsyncMethod, ILanguageService, IToasterService, LANGUAGE_SERVICE, ToastType} from "../common-types";

@Injectable()
export class BaseToasterService<T = any> implements IToasterService {

    protected colorMap: Record<ToastType, string>;

    constructor(@Inject(LANGUAGE_SERVICE) protected language: ILanguageService) {
        this.colorMap = {
            info: "#2F96B4",
            success: "#51A351",
            warning: "#F89406",
            error: "#BD362F"
        };
    }

    info(message: string, params?: any) {
        this.translate(message, params, "info");
    }

    success(message: string, params?: any) {
        this.translate(message, params, "success");
    }

    warning(message: string, params?: any){
        this.translate(message, params, "warning");
    }

    error(message: string, params?: any) {
        this.translate(message, params, "error");
    }

    infoPromised(message: string, params?: any) {
        return this.translatePromised(message, params, "info");
    }

    successPromised(message: string, params?: any) {
        return this.translatePromised(message, params, "success");
    }

    warningPromised(message: string, params?: any) {
        return this.translatePromised(message, params, "warning");
    }

    errorPromised(message: string, params?: any) {
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

    protected translate(message: string, params: any, type: ToastType): void {
        this.language.getTranslation(message, params).then(str => {
            this.show(str, type);
        });
    }

    protected async translatePromised(message: string, params: any, type: ToastType): Promise<T> {
        const str = await this.language.getTranslation(message, params);
        return this.show(str, type);
    }

    protected show(message: string, type: ToastType): T {
        console.log(message, `background: ${this.colorMap[type]}; color: #ffffff`);
        return null;
    }
}
