import {Inject, Injectable} from "@angular/core";
import {AsyncMethod, ILanguageService, IToasterService, LANGUAGE_SERVICE, ToastType} from "../common-types";

@Injectable()
export class BaseToasterService implements IToasterService {

    protected colorMap: Record<ToastType, string>;

    constructor(@Inject(LANGUAGE_SERVICE) protected language: ILanguageService) {
        this.colorMap = {
            info: "#2F96B4",
            success: "#51A351",
            warning: "#F89406",
            error: "#BD362F"
        };
    }

    info(message: string, params?: any): void {
        this.translateMessage(message, params, "info");
    }

    success(message: string, params?: any): void {
        this.translateMessage(message, params, "success");
    }

    warning(message: string, params?: any): void {
        this.translateMessage(message, params, "warning");
    }

    error(message: string, params?: any): void {
        this.translateMessage(message, params, "error");
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

    protected translateMessage(message: string, params: any, type: ToastType): void {
        this.language.getTranslation(message, params).then(str => {
            this.show(message, type);
        });
    }

    protected show(message: string, type: ToastType): any {
        console.log(message, `background: ${this.colorMap[type]}; color: #ffffff`)
    }
}
