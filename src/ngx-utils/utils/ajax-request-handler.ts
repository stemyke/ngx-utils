import {AjaxRequestCallback, IAjaxRequestDetails} from "../common-types";

export class AjaxRequestHandler {

    private static isOverridden: boolean = false;

    public params: any;

    constructor(private pattern: RegExp, private callback: AjaxRequestCallback) {
        this.params = {};
        if (typeof XMLHttpRequest !== "undefined" && !AjaxRequestHandler.isOverridden) {
            AjaxRequestHandler.isOverridden = true;
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method: string, url?: string, async?: boolean, user?: string, password?: string): void {
                originalOpen.apply(this, arguments);
                window.dispatchEvent(new CustomEvent("ajaxRequest", {
                    detail: {
                        request: this,
                        method: method,
                        url: url
                    }
                }))
            };
        }
    }

    listen(): AjaxRequestHandler {
        if (typeof window === "undefined") return this;
        window.addEventListener("ajaxRequest", this.listener);
        return this;
    }

    forget(): AjaxRequestHandler {
        if (typeof window === "undefined") return;
        window.removeEventListener("ajaxRequest", this.listener);
        return this;
    }

    private listener = (event: CustomEvent): void => {
        const details: IAjaxRequestDetails = event.detail;
        if (this.pattern.test(details.url)) this.callback(details, this.params);
    };
}
