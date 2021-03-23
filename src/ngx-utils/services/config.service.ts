import {Inject, Injectable, Optional} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UniversalService} from "./universal.service";
import {BASE_CONFIG, IConfigService, IConfiguration} from "../common-types";

@Injectable()
export class ConfigService implements IConfigService {

    protected loadedConfig: IConfiguration;
    protected loader: Promise<IConfiguration>;
    protected readonly loaderFunc: () => Promise<IConfiguration>;

    get load(): () => Promise<IConfiguration> {
        return this.loaderFunc;
    }

    get config(): IConfiguration {
        return this.loadedConfig;
    }

    get configUrl(): string {
        return `${this.loadedConfig.baseUrl}config/config.json`;
    }

    constructor(readonly http: HttpClient, readonly universal: UniversalService, @Optional() @Inject(BASE_CONFIG) baseConfig: IConfiguration = null) {
        for (const key in []) {
            Object.defineProperty(Array.prototype, key, {
                enumerable: false
            });
        }
        let baseUrl = "";
        if (this.universal.isBrowser) {
            const scriptSrc = (document.currentScript as HTMLScriptElement).src;
            const srcParts = scriptSrc.split(".js");
            baseUrl = scriptSrc.substr(0, srcParts[0].lastIndexOf("/") + 1);
        }
        this.loadedConfig = Object.assign({
            baseUrl
        }, baseConfig || {});
        this.loaderFunc = () => {
            this.loader = this.loader || new Promise<any>((resolve, reject) => {
                this.loadJson().then(config => {
                    this.loadedConfig = config = Object.assign(this.loadedConfig, config);
                    this.prepareConfig(config).then(resolve);
                }, reject);
            });
            return this.loader;
        };
        this.initService()
    }

    protected initService(): void {

    }

    protected loadJson(): Promise<IConfiguration> {
        if (this.universal.isServer) {
            return Promise.resolve(this.loadedConfig);
        }
        const configUrl = this.configUrl;
        return new Promise<any>((resolve, reject) => {
            this.http.get(configUrl).toPromise().then(response => {
                resolve(response);
            }, () => {
                reject("Config file not found at: " + configUrl);
            });
        });
    }

    protected prepareConfig(config: IConfiguration): Promise<IConfiguration> {
        return Promise.resolve(config);
    }

    prepareUrl(url: string, ending: string): string {
        const project = !this.loadedConfig ? "" : this.loadedConfig.project;
        url = url ? `${url.replace(/\/+$/, "")}${ending}` : ending;
        url = url.replace("[project]", project);
        return this.universal.isServer && url.startsWith("//") ? `http:${url}` : url;
    }

    getConfigValue(key: string): any {
        return this.loadedConfig[key];
    }

    getQueryParameter(name: string, url?: string): string {
        url = url || (this.universal.isServer ? "" : window.location.href);
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}
