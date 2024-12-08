import {Inject, Injectable} from "@angular/core";
import {IConfirmDialogConfig, IDialogConfig, IDialogService, IToasterService, TOASTER_SERVICE} from "../common-types";

@Injectable()
export class BaseDialogService implements IDialogService {

    constructor(@Inject(TOASTER_SERVICE) readonly toaster: IToasterService) {
    }

    dialog(config: IDialogConfig): void {
        if (!config) return;
        const button = !config.buttons ? null : config.buttons[0];
        if (!button) return;
        this.toaster.handleAsyncMethod(button.method);
    }

    confirm(config: IConfirmDialogConfig): void {
        if (!config) return;
        this.dialog({
            id: config.id,
            title: config.title,
            message: config.message,
            messageContext: config.messageContext,
            size: config.size,
            buttons: config.buttons || [
                {
                    text: config.okText,
                    classes: config.okClasses,
                    method: config.method
                },
                {
                    text: config.cancelText || "button.cancel",
                    classes: config.cancelClasses || "btn-default",
                    method: config.cancelMethod
                }
            ],
            onClose: config.cancelMethod,
            templates: config.templates
        });
    }
}
