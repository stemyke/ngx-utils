import {Injectable} from "@angular/core";
import {HttpClient, HttpHandler, HttpHeaders, HttpParams, HttpUrlEncodingCodec} from "@angular/common/http";
import {ObjectUtils} from "../utils/object.utils";
import {IHttpHeaders, IHttpParams} from "../common-types";

@Injectable()
export class BaseHttpClient extends HttpClient {

    requestHeaders: IHttpHeaders;
    requestParams: IHttpParams;
    renewTokenFunc: () => void;

    constructor(handler: HttpHandler) {
        super(handler);
        this.requestHeaders = {};
        this.requestParams = {};
    }

    makeHeaders(headers?: IHttpHeaders): HttpHeaders {
        headers = Object.assign({}, this.requestHeaders, headers);
        return new HttpHeaders(headers);
    }

    makeParams(params?: IHttpParams, language: string = "de"): HttpParams {
        params = Object.assign({}, this.requestParams, params);
        const httpParams = new HttpParams({
            encoder: new HttpUrlEncodingCodec(),
            fromObject: Object.keys(params || {}).reduce((result, key) => {
                const value = params[key];
                result[key] = ObjectUtils.isObject(value) ? JSON.stringify(value) : (ObjectUtils.isNullOrUndefined(value) ? "" : value.toString());
                return result;
            }, {})
        });
        return httpParams.set("language", httpParams.get("language") || language);
    }
}
