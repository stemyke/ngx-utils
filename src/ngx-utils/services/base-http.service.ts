import {Inject, Injectable, Optional} from "@angular/core";
import {HttpErrorResponse, HttpEventType, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Request} from "express";
import {REQUEST} from "@nguniversal/express-engine/tokens";

import {
    HttpPromise,
    IHttpHeaders,
    IHttpParams,
    IHttpService,
    IIssueContext,
    ILanguageService,
    IPaginationData,
    IRequestOptions,
    IToasterService,
    LANGUAGE_SERVICE,
    ProgressListener,
    TOASTER_SERVICE
} from "../common-types";

import {ObjectUtils} from "../utils/object.utils";
import {MathUtils} from "../utils/math.utils";

import {BaseHttpClient} from "./base-http.client";
import {UniversalService} from "./universal.service";
import {StorageService} from "./storage.service";
import {timeout} from "rxjs/operators";
import {TimeoutError} from "rxjs";

@Injectable()
export class BaseHttpService implements IHttpService {

    protected static failedRequests: Array<() => void> = [];

    get name(): string {
        return "base";
    }

    protected get withCredentials(): boolean {
        return true;
    }

    cache: any;

    protected static retryFailedRequests(): void {
        BaseHttpService.failedRequests.forEach(r => r());
        BaseHttpService.failedRequests = [];
    }

    get universal(): UniversalService {
        return this.storage.universal;
    }

    constructor(@Inject(BaseHttpClient) readonly client: BaseHttpClient,
                @Inject(StorageService) readonly storage: StorageService,
                @Inject(LANGUAGE_SERVICE) readonly language: ILanguageService,
                @Inject(TOASTER_SERVICE) readonly toaster: IToasterService,
                @Optional() @Inject(REQUEST) readonly request: Request = null
    ) {
        this.cache = {};
    }

    url(url: string): string {
        return url;
    }

    createUrl(url: string, params: IHttpParams): string {
        const httpParams = this.client.makeParams(params);
        const query = httpParams.keys().map(key => {
            return `${key}=${httpParams.get(key)}`;
        }).join("&");
        return `${this.url(url)}?${query}`;
    }

    makeListParams(page: number, itemsPerPage: number, orderBy: string = null, orderDescending: boolean = null, filter: string = null): IHttpParams {
        const params: IHttpParams = {
            page: (page - 1),
            limit: itemsPerPage
        };
        if (!ObjectUtils.isNullOrUndefined(orderBy) && !ObjectUtils.isNullOrUndefined(orderDescending)) {
            params.sort = `${orderDescending ? "-" : ""}${orderBy}`;
        }
        if (!ObjectUtils.isNullOrUndefined(filter)) {
            params.filter = filter;
        }
        return params;
    }

    protected getPromise(url: string, options?: IRequestOptions): HttpPromise {
        options = this.makeOptions(options, "GET");
        return this.toPromise(url, options);
    }

    protected deletePromise(url: string, options?: IRequestOptions): HttpPromise {
        options = this.makeOptions(options, "DELETE");
        return this.toPromise(url, options);
    }

    protected postPromise(url: string, body?: any, options?: IRequestOptions): HttpPromise {
        options = this.makeOptions(options, "POST", body);
        return this.toPromise(url, options);
    }

    protected putPromise(url: string, body?: any, options?: IRequestOptions): HttpPromise {
        options = this.makeOptions(options, "PUT", body);
        return this.toPromise(url, options);
    }

    protected patchPromise(url: string, body?: any, options?: IRequestOptions): HttpPromise {
        options = this.makeOptions(options, "PATCH", body);
        return this.toPromise(url, options);
    }

    protected uploadPromise(url: string, body: any, listener?: ProgressListener, options?: IRequestOptions): HttpPromise {
        const headers: any = {};
        if (body instanceof Blob) {
            headers["Content-Type"] = "application/octet-stream";
        }
        options = this.makeOptions(Object.assign({
            headers: headers,
            reportProgress: true
        }, options), "POST", body);
        return this.toPromise(url, options, listener);
    }

    protected listPromise(url: string, params: IHttpParams): Promise<IPaginationData> {
        return new Promise<IPaginationData>(resolve => {
            this.getPromise(url, {params: params}).then(data => {
                if (ObjectUtils.isArray(data)) {
                    resolve({
                        total: data.length,
                        items: data,
                        meta: {}
                    });
                    return;
                }
                resolve({
                    total: data.meta?.total || data?.total || data.items?.length || 0,
                    items: data.items || [],
                    meta: data.meta || {}
                });
            }, response => {
                if (response.status == 0 || response.status == 301) {
                    resolve({
                        total: 1,
                        items: [{
                            id: null,
                            label: "Not implemented."
                        }],
                        meta: {}
                    });
                    return true;
                }
                resolve({
                    total: 0,
                    items: [],
                    meta: {}
                });
                return false;
            });
        });
    }

    protected handleUnauthorizedError(absoluteUrl: string, options: IRequestOptions, reject: () => void): void {
        reject();
        if (BaseHttpService.failedRequests.length > 1) {
            return;
        }
        if (this.universal.isServer) return;
        console.log("User auth error", absoluteUrl, options);
    }

    protected toastWarning(message: string, issueContext: IIssueContext, reason: any, options: IRequestOptions): void {
        this.toaster.warning(message, {issueContext, reason, options});
    }

    protected toastError(message: string, issueContext: IIssueContext, reason: any, options: IRequestOptions): void {
        this.toaster.warning(message, {issueContext, reason, options});
    }

    protected toPromise(url: string, options: IRequestOptions, listener?: ProgressListener): HttpPromise {
        const issueContext: IIssueContext = {url: ""};

        return new HttpPromise(response => {
            if (!response) {
                if (this.universal.isServer) return;
                console.log("You may not need a reject Handler for this request!", this.name, url, options);
                return;
            }
            const reason = response.error || {};
            if (response.status == 0 || response.status == 301) {
                this.toastWarning(`${url} endpoint is not implemented! Click here, to quickly create an issue.`, issueContext, reason, options);
                return;
            }
            const regex = /((E11000 duplicate key error collection: (.)+\.)|(_1 dup key:(.)+))/g;
            if (reason.message && regex.test(reason.message)) {
                this.toastError("message.duplicate-key.error." + reason.message.replace(regex, "").replace(" index: ", "-"), issueContext, reason, options);
                return;
            }
            this.toastWarning(`${url} endpoint error is not handled properly! Click here, to quickly create an issue.`, issueContext, reason, options);
        }, (resolve, reject) => {
            this.absoluteUrl(url, options).then(absoluteUrl => {
                issueContext.url = absoluteUrl;
                const request = this.client.request(options.method, absoluteUrl, options);
                const finalRequest = ObjectUtils.isNumber(options.timeout) && options.timeout > 0
                    ? request.pipe(timeout(options.timeout)) : request;
                finalRequest.subscribe((event: any) => {
                    if (options.reportProgress && event.type === HttpEventType.UploadProgress) {
                        const progress = {
                            percentage: MathUtils.round(event.loaded / event.total, 2, 0.01),
                            loaded: event.loaded,
                            total: event.total
                        };
                        if (listener) {
                            listener(progress);
                        }
                        return;
                    }
                    const response = event instanceof HttpResponse ? event.body : event;
                    resolve(this.parseResponse(response, url, options));
                    const headers = options.headers as HttpHeaders;
                    const authKey = "Authorization";
                    // If we use token auth
                    if (this.client.renewTokenFunc && headers.has(authKey)) {
                        const currentTime = new Date().getTime();
                        const userTokenTime = this.storage.get("userTokenTime") || currentTime;
                        // And the last request was a long long time ago
                        if (currentTime - 600000 > userTokenTime) {
                            this.client.renewTokenFunc();
                        }
                    }
                }, (response: HttpErrorResponse | TimeoutError) => {
                    if (response instanceof TimeoutError || response.status == 0 || response.status == 301) {
                        reject(response);
                        return;
                    }
                    const headers = options.headers as HttpHeaders;
                    const authKey = "Authorization";
                    // If an authorization header exists and we still have an Unauthorized response prompt the user to log in again
                    if (headers.has(authKey) && response.status == 401) {
                        BaseHttpService.failedRequests.push(() => {
                            const extraHeaders = this.client.makeHeaders();
                            if (extraHeaders.has(authKey)) {
                                options.headers = headers.set(authKey, extraHeaders.get(authKey));
                            } else {
                                options.headers = headers.delete(authKey);
                            }
                            this.toPromise(url, options, listener).then(resolve, reject);
                        });
                        this.handleUnauthorizedError(absoluteUrl, options, () => reject(response));
                        return;
                    }
                    reject(response);
                });
            });
        });
    }

    protected checkHeaders(headers: any): boolean {
        if (!headers || !headers.cookie || !headers.referer || !headers.host) {
            return false;
        }
        return headers.referer.indexOf(headers.host) >= 0;
    }

    protected makeOptions(options?: IRequestOptions, method: string = "GET", body: any = {}): IRequestOptions {
        // Set base options
        options = options ? {...options} : {};
        options.params = this.client.makeParams(options.params);
        options.observe = "body";
        options.headers = options.headers || {};
        options.method = method;
        options.withCredentials = ObjectUtils.isBoolean(options.withCredentials) ? options.withCredentials : this.withCredentials;
        options.body = body || {};
        // Set cookies from server side request
        const headers = !this.request ? null : this.request.headers;
        if (this.checkHeaders(headers)) {
            options.headers["Cookie"] = headers.cookie;
        }
        options.headers = this.makeHeaders(options.headers as IHttpHeaders, method);
        return options;
    }

    protected makeHeaders(options?: IRequestOptions, method: string = "GET"): HttpHeaders {
        return this.client.makeHeaders(options.headers as IHttpHeaders);
    }

    protected parseResponse(response: any, url: string, options: IRequestOptions): any {
        return response;
    }

    protected parseUrl(url: string): string {
        return this.url(url).replace(/(?:((?!:).\/)\/)/g, "$1");
    }

    protected absoluteUrl(url: string, options: IRequestOptions): Promise<string> {
        return Promise.resolve(this.parseUrl(url));
    }

    protected expressRequestUrl(url: string): string {
        const req = this.request;
        if (!req || !url || url.startsWith("http") || url.startsWith("//")) return url;
        const separator = url.startsWith("/") ? "" : "/";
        return `${req.protocol}://${req.get("host")}${separator}${url}`;
    }
}
