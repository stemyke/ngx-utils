import {Injectable} from "@angular/core";

import {IApiService, IHttpParams, IRequestOptions, ProgressListener} from "../common-types";
import {BaseHttpService} from "./base-http.service";
import {IPaginationData} from "../common-types";

@Injectable()
export class ApiService extends BaseHttpService implements IApiService {

    get name(): string {
        return "api";
    }

    url(url: string): string {
        const baseUrl = this.expressRequestUrl(`/api/${url}`);
        if (url == "api-docs" || url == "socket") {
            return baseUrl.replace("/api/", "/");
        }
        return baseUrl;
    }

    get(url: string, options?: IRequestOptions, body?: any): Promise<any> {
        return this.getPromise(url, options, body);
    }

    delete(url: string, options?: IRequestOptions, body?: any): Promise<any> {
        return this.deletePromise(url, options, body);
    }

    post(url: string, body?: any, options?: IRequestOptions): Promise<any> {
        return this.postPromise(url, body, options);
    }

    put(url: string, body?: any, options?: IRequestOptions): Promise<any> {
        return this.putPromise(url, body, options);
    }

    patch(url: string, body?: any, options?: IRequestOptions): Promise<any> {
        return this.patchPromise(url, body, options);
    }

    upload(url: string, body: any, listener?: ProgressListener, options?: IRequestOptions): Promise<any> {
        return this.uploadPromise(url, body, listener, options);
    }

    list(url: string, params: IHttpParams): Promise<IPaginationData> {
        return this.listPromise(url, params);
    }
}
