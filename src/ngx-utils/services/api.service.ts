import {Injectable} from "@angular/core";

import {
    HttpRequestOptions,
    HttpRequestQuery,
    IApiService,
    IPaginationData,
    ProgressListener,
    UploadData
} from "../common-types";
import {BaseHttpService} from "./base-http.service";
import {SOCKET_IO_PATH} from "../tokens";

@Injectable()
export class ApiService extends BaseHttpService implements IApiService {

    get name(): string {
        return "api";
    }

    url(url: string): string {
        const config = this.configs.config;
        const baseUrl = this.expressRequestUrl(`${config.apiUrl}${url}`);
        const socket = this.injector.get(SOCKET_IO_PATH);
        if (url == "api-docs" || url == socket) {
            return baseUrl.replace("/api/", "/");
        }
        return baseUrl;
    }

    get(url: string, options?: HttpRequestOptions, body?: any): Promise<any> {
        return this.getPromise(url, options, body);
    }

    delete(url: string, options?: HttpRequestOptions, body?: any): Promise<any> {
        return this.deletePromise(url, options, body);
    }

    post(url: string, body?: any, options?: HttpRequestOptions): Promise<any> {
        return this.postPromise(url, body, options);
    }

    put(url: string, body?: any, options?: HttpRequestOptions): Promise<any> {
        return this.putPromise(url, body, options);
    }

    patch(url: string, body?: any, options?: HttpRequestOptions): Promise<any> {
        return this.patchPromise(url, body, options);
    }

    upload(url: string, body: UploadData, listener?: ProgressListener, options?: HttpRequestOptions): Promise<any> {
        return this.uploadPromise(url, body, listener, options);
    }

    list(url: string, params: HttpRequestQuery, options?: HttpRequestOptions): Promise<IPaginationData> {
        options = options || {};
        options.params = Object.assign(options.params || {}, params || {});
        return this.listPromise(url, options);
    }
}
