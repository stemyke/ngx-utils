import {Injectable} from "@angular/core";
import {HttpClient, HttpHandler, HttpHeaders, HttpParams, HttpUrlEncodingCodec} from "@angular/common/http";
import {HttpRequestHeaders, HttpRequestQuery} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";

@Injectable()
export class BaseHttpClient extends HttpClient {

    requestHeaders: HttpRequestHeaders;
    requestParams: HttpRequestQuery;
    renewTokenFunc: () => void;

    protected extraRequestParams: HttpRequestQuery;

    constructor(handler: HttpHandler) {
        super(handler);
        this.requestHeaders = {};
        this.requestParams = {};
        this.extraRequestParams = {
            language: "en"
        };
    }

    makeHeaders(headers?: HttpRequestHeaders, withCredentials: boolean = true): HttpHeaders {
        headers = Object.assign({}, this.requestHeaders, headers);
        const authHeader = headers["Authorization"] as string || "";
        if (!withCredentials && !authHeader.startsWith("Bearer")) {
            delete headers["Authorization"];
        }
        return new HttpHeaders(headers);
    }

    makeParams(params?: HttpRequestQuery): HttpParams {
        params = Object.assign({}, this.extraRequestParams, this.requestParams, params);
        return new HttpParams({
            encoder: new HttpUrlEncodingCodec(),
            fromObject: Object.keys(params || {}).reduce((result, key) => {
                const value = params[key];
                result[key] = ObjectUtils.isObject(value) ? JSON.stringify(value) : (ObjectUtils.isNullOrUndefined(value) ? "" : value.toString());
                return result;
            }, {})
        });
    }

    setExtraRequestParam(name: string, value?: any): void {
        if (typeof value == "undefined") {
            delete this.extraRequestParams[name];
            return;
        }
        this.extraRequestParams[name] = value;
    }
}
