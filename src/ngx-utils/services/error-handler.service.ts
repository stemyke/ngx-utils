import {ErrorHandler, Injectable, Injector} from "@angular/core";
import {UniversalService} from "./universal.service";
import {ErrorHandlerCallback, IToasterService} from "../common-types";
import {ERROR_HANDLER, TOASTER_SERVICE} from "../tokens";
import {md5} from "../utils/crypto.utils";

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
        const key = md5(`${error.message} ${error.stack}`);
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
