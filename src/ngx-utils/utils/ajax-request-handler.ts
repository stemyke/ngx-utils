export interface IAjaxRequestDetails {
    request: XMLHttpRequest,
    method: string;
    url: string;
}

export type AjaxRequestCallback = (details: IAjaxRequestDetails, params: any) => void;

export class AjaxRequestHandler {

    private params: any;

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
