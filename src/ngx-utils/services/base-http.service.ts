import {Inject, Injectable, Injector, Optional} from "@angular/core";
import {HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {Request} from "express";

import {
    CacheExpireMode,
    IConfigService,
    HttpRequestHeaders,
    HttpRequestQuery,
    IHttpService,
    IIssueContext,
    ILanguageService,
    IPaginationData,
    HttpClientRequestOptions,
    IToasterService,
    ProgressListener, HttpRequestOptions, UploadData
} from "../common-types";

import {ObjectUtils} from "../utils/object.utils";
import {MathUtils} from "../utils/math.utils";

import {BaseHttpClient} from "./base-http.client";
import {UniversalService} from "./universal.service";
import {StorageService} from "./storage.service";
import {timeout} from "rxjs/operators";
import {Observable, TimeoutError} from "rxjs";
import {CONFIG_SERVICE, EXPRESS_REQUEST, LANGUAGE_SERVICE, TOASTER_SERVICE} from "../tokens";
import {CacheService} from "./cache.service";
import {hashCode} from "../utils/misc";

@Injectable()
export class BaseHttpService implements IHttpService {

    protected static failedRequests: Array<() => void> = [];

    get name(): string {
        return "base";
    }

    protected get withCredentials(): boolean {
        return true;
    }

    requestHeaders: HttpRequestHeaders;
    requestParams: HttpRequestQuery;

    protected static retryFailedRequests(): void {
        BaseHttpService.failedRequests.forEach(r => r());
        BaseHttpService.failedRequests = [];
    }

    get universal(): UniversalService {
        return this.storage.universal;
    }

    constructor(readonly injector: Injector,
                readonly client: BaseHttpClient,
                readonly storage: StorageService,
                readonly caches: CacheService,
                @Inject(LANGUAGE_SERVICE) readonly language: ILanguageService,
                @Inject(TOASTER_SERVICE) readonly toaster: IToasterService,
                @Inject(CONFIG_SERVICE) readonly configs: IConfigService,
                @Optional() @Inject(EXPRESS_REQUEST) readonly request: Request = null
    ) {
        this.requestHeaders = {};
        this.requestParams = {};
        this.initService();
    }

    protected initService(): void {

    }

    cached(mode: CacheExpireMode): Observable<any> {
        if (mode === "auth") {
            return this.caches.userChanged;
        }
        if (mode instanceof Date) {
            return this.caches.expiresAt(mode);
        }
        return mode === false ? this.caches.ignore : this.caches.permanent;
    }

    url(url: string): string {
        return url;
    }

    createUrl(url: string, params: HttpRequestQuery): string {
        const httpParams = this.client.makeParams(params);
        const query = httpParams.keys().map(key => {
            return `${key}=${httpParams.get(key)}`;
        }).join("&");
        return `${this.url(url)}?${query}`;
    }

    makeListParams(page: number, itemsPerPage: number, orderBy: string = null, orderDescending: boolean = null, filter: string = null): HttpRequestQuery {
        const params: HttpRequestQuery = {
            page: (page - 1),
            limit: itemsPerPage
        };
        if (!ObjectUtils.isNullOrUndefined(orderBy)) {
            params.sort = `${orderDescending ? "-" : ""}${orderBy}`;
        }
        if (!ObjectUtils.isNullOrUndefined(filter)) {
            params.filter = filter;
        }
        return params;
    }

    protected getPromise(url: string, options?: HttpRequestOptions, body?: any) {
        options = this.makeOptions(options, "GET", body);
        return this.toPromise(url, options);
    }

    protected deletePromise(url: string, options?: HttpRequestOptions, body?: any) {
        options = this.makeOptions(options, "DELETE", body);
        return this.toPromise(url, options);
    }

    protected postPromise(url: string, body?: any, options?: HttpRequestOptions) {
        options = this.makeOptions(options, "POST", body);
        return this.toPromise(url, options);
    }

    protected putPromise(url: string, body?: any, options?: HttpRequestOptions) {
        options = this.makeOptions(options, "PUT", body);
        return this.toPromise(url, options);
    }

    protected patchPromise(url: string, body?: any, options?: HttpRequestOptions) {
        options = this.makeOptions(options, "PATCH", body);
        return this.toPromise(url, options);
    }

    protected uploadPromise(url: string, body: UploadData, listener?: ProgressListener, options?: HttpRequestOptions) {
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

    protected listPromise(url: string, options?: HttpClientRequestOptions): Promise<IPaginationData> {
        return new Promise<IPaginationData>(resolve => {
            this.getPromise(url, options).then(data => {
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

    protected handleUnauthorizedError(absoluteUrl: string, options: HttpClientRequestOptions, reject: () => void): void {
        reject();
        if (BaseHttpService.failedRequests.length > 1) {
            return;
        }
        if (this.universal.isServer) return;
        console.log("User auth error", absoluteUrl, options);
    }

    protected toastWarning(message: string, issueContext: IIssueContext, reason: any, options: HttpClientRequestOptions): void {
        this.toaster.warning(message, {issueContext, reason, options});
    }

    protected toastError(message: string, issueContext: IIssueContext, reason: any, options: HttpClientRequestOptions): void {
        this.toaster.warning(message, {issueContext, reason, options});
    }

    protected toPromise(url: string, requestOptions: HttpRequestOptions, listener?: ProgressListener): Promise<any> {
        const {cache, read, ...options} = requestOptions;
        const absoluteUrl = this.absoluteUrl(url, options);
        const cacheKey = `request-${hashCode(absoluteUrl)}-${hashCode(options)}`;
        const issueContext: IIssueContext = {url: absoluteUrl};
        return this.caches.use(`${cacheKey}-${read}`, async () => {
            const response = await this.caches.use(cacheKey, () => new HttpPromise(response => {
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
                const request = this.client.request(options.method, absoluteUrl, options);
                const finalRequest = ObjectUtils.isNumber(options.timeout) && options.timeout > 0
                    ? request.pipe(timeout(options.timeout)) : request;
                finalRequest.subscribe({
                    next: event => {
                        if (options.reportProgress && event?.type === HttpEventType.UploadProgress) {
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
                        resolve(event);
                        const headers = options.headers as HttpHeaders;
                        const authKey = "Authorization";
                        // If we use token auth
                        if (this.client.renewTokenFunc && headers.has(authKey)) {
                            const currentTime = Date.now() + 60_000;
                            const userTokenTime = this.getUserTokenTime() || currentTime;
                            // And the stored token expiration time is almost ended
                            if (currentTime >= userTokenTime) {
                                this.client.renewTokenFunc();
                            }
                        }
                    },
                    error: (response: HttpErrorResponse | TimeoutError) => {
                        if (response instanceof TimeoutError || response.status == 0 || response.status == 301) {
                            reject(response);
                            return;
                        }
                        const headers = options.headers as HttpHeaders;
                        const authKey = "Authorization";
                        // If an authorization header exists, and we still have an Unauthorized response prompt the user to log in again
                        if (headers.has(authKey) && response.status == 401) {
                            const pushed = this.pushFailedRequest(url, options, () => {
                                options.headers = this.makeHeaders(options.originalHeaders);
                                this.toPromise(url, options, listener).then(resolve, reject);
                            });
                            if (pushed) {
                                this.handleUnauthorizedError(absoluteUrl, options, () => reject(response));
                                return;
                            }
                        }
                        reject(response);
                    }
                });
            }), cache);
            return this.parseResponse(response, url, options, read);
        }, cache);
    }

    protected getUserTokenTime(): number {
        return this.storage.get("userTokenTime");
    }

    protected pushFailedRequest(url: string, options: HttpClientRequestOptions, req: () => void): boolean {
        if (url.indexOf("token") >= 0 || url === "user") return false;
        BaseHttpService.failedRequests.push(req);
        return true;
    }

    protected checkHeaders(headers: any): boolean {
        if (!headers || !headers.cookie || !headers.referer || !headers.host) {
            return false;
        }
        return headers.referer.indexOf(headers.host) >= 0;
    }

    protected makeOptions(options?: HttpRequestOptions, method: string = "GET", body?: any, cache?: Observable<any>): HttpClientRequestOptions {
        // Set base options
        options = options ? {...options} : {};
        options.cache = options.cache || cache || this.caches.ignore;
        options.method = method;
        options.observe = options.observe || "body";
        options.originalHeaders = options.originalHeaders || (options.headers as HttpRequestHeaders) || {};
        options.withCredentials = ObjectUtils.isBoolean(options.withCredentials) ? options.withCredentials : this.withCredentials;
        options.body = body || {};
        // Set cookies from server side request
        const headers = !this.request ? null : this.request.headers;
        if (this.checkHeaders(headers)) {
            options.headers["Cookie"] = headers.cookie;
        }
        options.headers = this.makeHeaders(options);
        options.params = this.makeParams(options);
        return options;
    }

    protected makeHeaders(options: HttpClientRequestOptions): HttpHeaders {
        return this.client.makeHeaders(Object.assign({}, this.requestHeaders, options?.headers || {}));
    }

    protected makeParams(options: HttpClientRequestOptions): HttpParams {
        return this.client.makeParams(Object.assign({}, this.requestParams, options?.params || {}));
    }

    protected parseResponse(response: any, url: string, options: HttpClientRequestOptions, read: string): any {
        if (!read) return response;
        if (response instanceof HttpResponse) {
            response = response.body;
        }
        return ObjectUtils.isObject(response) ? response[read] : response;
    }

    protected parseUrl(url: string): string {
        return this.url(url).replace(/(?:((?!:).\/)\/)/g, "$1");
    }

    protected absoluteUrl(url: string, options: HttpClientRequestOptions): string {
        return this.parseUrl(url);
    }

    protected expressRequestUrl(url: string): string {
        const req = this.request;
        if (!req || !url || url.startsWith("http") || url.startsWith("//")) return url;
        const separator = url.startsWith("/") ? "" : "/";
        return `${req.protocol}://${req.get("host")}${separator}${url}`;
    }
}

type PromiseExecutor = (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => void;

class HttpPromise extends Promise<any> {

    protected rejectHandler: (reason?: HttpErrorResponse) => void;
    protected hasRejectHandler: boolean;
    protected attachCount: number;
    protected runCount: number;

    constructor(rejectHandler: (reason?: HttpErrorResponse) => void, executor: PromiseExecutor) {
        super(executor);
        this.rejectHandler = rejectHandler;
        this.attachCount = 0;
        this.runCount = 0;
    }

    then<TResult1, TResult2>(onFulfilled?: ((value: any) => (PromiseLike<TResult1> | TResult1)) | null | undefined,
                             onRejected?: ((reason: HttpErrorResponse) => (PromiseLike<TResult2> | TResult2)) | null | undefined): Promise<TResult1 | TResult2> {
        this.attachCount++;
        return super.then(value => {
            this.runCount++;
            return onFulfilled ? onFulfilled(value) : null;
        }, (reason: HttpErrorResponse) => {
            const result: any = onRejected ? onRejected(reason) : null;
            this.hasRejectHandler = this.hasRejectHandler || (onRejected && result !== false);
            this.runCount++;
            this.rejectHandler(this.runCount == this.attachCount && !this.hasRejectHandler ? reason : null);
            return result;
        });
    }

    catch<TResult = never>(onRejected?: ((reason: HttpErrorResponse) => (PromiseLike<TResult> | TResult)) | null | undefined): Promise<any | TResult> {
        return this.then(null, onRejected);
    }
}
