import {AjaxRequestCallback, IAjaxRequestDetails} from "../common-types";

export class AjaxRequestHandler {

    public params: any;

    constructor(private pattern: RegExp, private callback: AjaxRequestCallback) {
        this.params = {};
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
