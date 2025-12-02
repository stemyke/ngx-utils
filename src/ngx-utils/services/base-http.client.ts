import {Injectable} from "@angular/core";
import {HttpClient, HttpHandler, HttpHeaders} from "@angular/common/http";
import {RequestBag} from "./request-bag";
import {HttpRequestHeaders, HttpRequestQuery, IBaseHttpClient} from "../common-types";

@Injectable()
export class BaseHttpClient extends HttpClient implements IBaseHttpClient {

    renewTokenFunc: () => void;

    readonly bag: RequestBag;

    constructor(handler: HttpHandler) {
        super(handler);
        this.bag = new RequestBag();
    }

    get requestHeaders(): Readonly<HttpRequestHeaders> {
        return this.bag.requestHeaders;
    }

    get requestParams(): Readonly<HttpRequestQuery> {
        return this.bag.requestParams;
    }

    setHeader(name: string, value?: string | string[]): void {
        this.bag.setHeader(name, value);
    }

    getHeader(name: string): string {
        return this.bag.getHeader(name);
    }

    setParam(name: string, value?: any): void {
        this.bag.setParam(name, value);
    }

    makeHeaders(): HttpHeaders {
        return this.bag.makeHeaders();
    }
}
