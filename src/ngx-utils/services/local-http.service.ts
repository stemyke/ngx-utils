import {Injectable} from "@angular/core";

import {HttpClientRequestOptions, IConfiguration, SvgDefinition, SvgSourceModifier} from "../common-types";
import {BaseHttpService} from "./base-http.service";
import {ObjectUtils} from "../utils/object.utils";
import {svgToDataUri} from "../utils/string.utils";

@Injectable()
export class LocalHttpService extends BaseHttpService {

    protected svgs: Record<string, SvgDefinition>;
    protected images: Record<string, Promise<HTMLImageElement>>;

    get name(): string {
        return "local-http";
    }

    get config(): IConfiguration {
        return this.configs.config;
    }

    protected get withCredentials(): boolean {
        return false;
    }

    protected initService(): void {
        super.initService();
        this.svgs = {};
        this.images = {};
    }

    url(url: string): string {
        if (!url) return url;
        const config = this.config;
        const baseUrl = config.cdnUrl || config.baseUrl || "";
        return url.startsWith("data:") || url.startsWith("http") || url.startsWith("//")
            ? url
            : `${baseUrl}${url}`;
    }

    get(url: string, options?: HttpClientRequestOptions, body?: any): Promise<any> {
        options = this.makeOptions(options, "GET", body, this.caches.permanent);
        return this.toPromise(url, options);
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
            image.onerror = error => {
                console.warn(error);
                reject(`Can't load image from url: ${url}`);
            };
        });

        return this.images[url];
    }

    svgUrlFromSource(sourceStr: string, modifier?: SvgSourceModifier): string {
        if (!sourceStr.startsWith("<svg")) {
            throw new Error(`Src is possibly not an svg.. '${sourceStr.substring(0, 10)}'`);
        }
        if (!this.svgs[sourceStr]) {
            const parser = document.createElement("div");
            parser.innerHTML = sourceStr;
            const source = parser.querySelector("svg");
            const width = parseFloat(source.getAttribute("width"));
            const height = parseFloat(source.getAttribute("height"));
            const vb = source.getAttribute("viewBox").split(" ").map(parseFloat);
            this.svgs[sourceStr] = {
                source,
                width: width || vb[2],
                height: height || vb[3],
            };
        }
        const def = this.svgs[sourceStr];
        const sourceClone = def.source.cloneNode(true) as SVGSVGElement;
        const svgModified = ObjectUtils.isFunction(modifier) ? modifier(sourceClone, def.width, def.height) : def.source.outerHTML;
        return svgToDataUri(svgModified)
    }

    svgFromSource(sourceStr: string, modifier?: SvgSourceModifier): Promise<HTMLImageElement> {
        return this.getImage(this.svgUrlFromSource(sourceStr, modifier));
    }

    async getSvgUrl(url: string, modifier?: SvgSourceModifier): Promise<string> {
        try {
            const svgSrc = await this.get(url, {responseType: "text"}) as string;
            return this.svgUrlFromSource(svgSrc, modifier);
        } catch (e) {
            throw new Error(`Can't get svg from url: ${url}, Error: ${e?.message}`);
        }
    }

    async getSvgImage(url: string, modifier?: SvgSourceModifier): Promise<HTMLImageElement> {
        try {
            const svgSrc = await this.get(url, {responseType: "text"}) as string;
            return await this.svgFromSource(svgSrc, modifier);
        } catch (e) {
            throw new Error(`Can't get svg from url: ${url}, Error: ${e?.message}`);
        }
    }
}
