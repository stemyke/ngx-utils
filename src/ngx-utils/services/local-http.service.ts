import {Injectable} from "@angular/core";

import {IRequestOptions} from "../common-types";
import {BaseHttpService} from "./base-http.service";

@Injectable()
export class LocalHttpService extends BaseHttpService {

    private images: { [url: string]: Promise<HTMLImageElement> };

    get name(): string {
        return "local-http";
    }

    protected get withCredentials(): boolean {
        return false;
    }

    protected initService(): void {
        this.images = {};
    }

    url(url: string): string {
        if (!url) return url;
        const config = this.configs.config;
        const baseUrl = config.cdnUrl || config.baseUrl || "";
        return url.startsWith("data:") || url.startsWith("http") || url.startsWith("//")
            ? url
            : `${baseUrl}${url}`;
    }

    get(url: string, options?: IRequestOptions): Promise<any> {
        this.cache[url] = this.cache[url] || this.getPromise(url, options);
        return this.cache[url];
    }

    getImage(url: string): Promise<HTMLImageElement> {
        if (this.universal.isServer)
            return Promise.resolve(null);
        if (!url)
            return Promise.resolve(new Image());

        this.images[url] = this.images[url] || new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = this.url(url);
            image.onload = () => resolve(image);
            image.onerror = reject;
        });

        return this.images[url];
    }
}