import {ErrorHandler, Injectable, Injector} from "@angular/core";
import {UniversalService} from "./universal.service";
import {ERROR_HANDLER, ErrorHandlerCallback, IToasterService, TOASTER_SERVICE} from "../common-types";

@Injectable()
export class ErrorHandlerService extends ErrorHandler {

    private toaster: IToasterService;
    private universal: UniversalService;
    private errorCb: ErrorHandlerCallback;
    private readonly errorMap: any;

    constructor(readonly injector: Injector) {
        super();
        this.errorMap = {};
    }

    handleError(error: Error): void {
        this.universal = this.universal || this.injector.get(UniversalService);
        const date = new Date();
        try {
            this.errorCb = this.errorCb || this.injector.get(ERROR_HANDLER);
            this.errorCb(`[${date}]: ${error.message}\n${error.stack}`);
        } catch (e) {
            if (!this.universal || this.universal.isServer) {
                console.error(`[${date}]: ${error.message}\n${error.stack}`);
                return;
            }
        }
        if (!this.universal || this.universal.isServer) return;
        const key = typeof btoa !== "undefined" ? btoa(decodeURI(encodeURIComponent(`${error.message} ${error.stack}`))) : error.message;
        if (this.errorMap[key] && this.errorMap[key].getTime() > date.getTime() - 5000) return;
        this.errorMap[key] = date;
        try {
            this.toaster = this.toaster || this.injector.get(TOASTER_SERVICE);
            this.toaster.error(`[${date}]: ${error.message}\n${error.stack}`);
        } catch (e) {
        }
        console.error(`[${date}]: ${error.message}\n${error.stack}`);
    }
}
