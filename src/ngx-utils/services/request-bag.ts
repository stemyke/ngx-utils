import {HttpHeaders, HttpParams, HttpUrlEncodingCodec} from "@angular/common/http";
import {HttpRequestHeaders, HttpRequestQuery} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";

export class RequestBag {

    protected readonly headers: HttpRequestHeaders;
    protected readonly params: HttpRequestQuery;

    get requestHeaders(): Readonly<HttpRequestHeaders> {
        return this.headers;
    }

    get requestParams(): Readonly<HttpRequestQuery> {
        return this.params;
    }

    constructor(protected source?: RequestBag) {
        this.headers = {};
        this.params = {};
    }

    makeHeaders(headersObj?: HttpRequestHeaders | HttpHeaders, withCredentials: boolean = true): HttpHeaders {
        const source = this.convertHeaders(headersObj);
        const headers = Object.assign({}, this.source?.headers || {}, this.headers, source);
        const authHeader = headers["Authorization"] as string || "";
        if (!withCredentials && !authHeader.startsWith("Bearer")) {
            delete headers["Authorization"];
        }
        return new HttpHeaders(headers);
    }

    makeParams(paramsObj?: HttpParams | HttpRequestQuery): HttpParams {
        const source = this.convertParams(paramsObj);
        const params = Object.assign({}, this.source?.params || {}, this.params, source);
        return new HttpParams({
            encoder: new HttpUrlEncodingCodec(),
            fromObject: Object.keys(params || {}).reduce((result, key) => {
                const value = params[key];
                result[key] = ObjectUtils.isObject(value) ? JSON.stringify(value) : (ObjectUtils.isNullOrUndefined(value) ? "" : value.toString());
                return result;
            }, {})
        });
    }

    setHeader(name: string, value?: string | string[]): void {
        if (value === undefined) {
            delete this.headers[name];
            return;
        }
        this.headers[name] = value;
    }

    getHeader(name: string): string {
        return String(this.headers[name] || "");
    }

    setParam(name: string, value?: any): void {
        if (value === undefined) {
            delete this.params[name];
            return;
        }
        this.params[name] = value;
    }

    convertHeaders(headers: HttpHeaders | HttpRequestHeaders): HttpRequestHeaders {
        if (headers instanceof HttpHeaders) {
            return headers.keys().reduce((res, key) => {
                res[key] = headers.getAll(key);
                return res;
            }, {} as HttpRequestHeaders);
        }
        return headers || {};
    }

    convertParams(params: HttpParams | HttpRequestQuery): HttpRequestQuery {
        if (params instanceof HttpParams) {
            return params.keys().reduce((res, key) => {
                res[key] = params.getAll(key);
                return res;
            }, {} as HttpRequestQuery);
        }
        return params || {};
    }
}
