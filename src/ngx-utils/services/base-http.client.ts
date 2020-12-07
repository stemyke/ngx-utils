import {Injectable} from "@angular/core";
import {HttpClient, HttpHandler, HttpHeaders, HttpParams, HttpUrlEncodingCodec} from "@angular/common/http";
import {IHttpHeaders, IHttpParams} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";

@Injectable()
export class BaseHttpClient extends HttpClient {

    requestHeaders: IHttpHeaders;
    requestParams: IHttpParams;
    renewTokenFunc: () => void;

    protected extraRequestParams: IHttpParams;

    constructor(handler: HttpHandler) {
        super(handler);
        this.requestHeaders = {};
        this.requestParams = {};
        this.extraRequestParams = {
            language: "en"
        };
    }

    makeHeaders(headers?: IHttpHeaders, withCredentials: boolean = true): HttpHeaders {
        headers = Object.assign({}, this.requestHeaders, headers);
        if (!withCredentials) {
            delete headers["Authorization"];
        }
        return new HttpHeaders(headers);
    }

    makeParams(params?: IHttpParams): HttpParams {
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

    setExtraRequestParam(name: string, value: any): void {
        this.extraRequestParams[name] = value;
    }
}
