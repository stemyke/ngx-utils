import {Inject, Injectable, Injector, isDevMode, Optional} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import * as JSON5 from "json5";
import {UniversalService} from "./universal.service";
import {APP_BASE_URL, BASE_CONFIG, IConfigService, IConfiguration, ROOT_ELEMENT, SCRIPT_PARAMS} from "../common-types";
import {StringUtils} from "../utils/string.utils";

@Injectable()
export class ConfigService implements IConfigService {

    protected baseConfig: IConfiguration;
    protected loadedConfig: IConfiguration;
    protected scriptParameters: any;
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

    constructor(readonly http: HttpClient,
                readonly universal: UniversalService,
                readonly injector: Injector,
                @Inject(ROOT_ELEMENT) readonly rootElement: any,
                @Inject(APP_BASE_URL) readonly baseUrl: string,
                @Optional() @Inject(BASE_CONFIG) baseConfig: IConfiguration = null,
                @Optional() @Inject(SCRIPT_PARAMS) scriptParams: any = null) {
        for (const key in []) {
            Object.defineProperty(Array.prototype, key, {
                enumerable: false
            });
        }
        this.baseConfig = baseConfig || {};
        this.loadedConfig = Object.assign(
            !this.baseUrl ? {} : {baseUrl: this.baseUrl, baseDomain: StringUtils.parseDomain(this.baseUrl)},
            this.baseConfig
        );
        this.scriptParameters = scriptParams || {};
        this.loaderFunc = () => {
            this.loader = this.loader || new Promise<any>((resolve, reject) => {
                this.loadJson().then(config => {
                    this.loadedConfig = config = Object.assign(this.loadedConfig, config);
                    this.prepareConfig(config).then(c => {
                        this.loadedConfig = c;
                        c.baseUrl = c.baseUrl || "/";
                        resolve(c);
                    });
                }, reject);
            });
            return this.loader;
        };
        this.initService();
    }

    protected initService(): void {

    }

    protected async loadJson(): Promise<IConfiguration> {
        if (this.universal.isServer) {
            return Promise.resolve(this.loadedConfig);
        }
        const configUrl = this.configUrl;
        try {
            const config5 = await this.http.get(isDevMode() ? `${configUrl}5` : configUrl, {responseType: "text"}).toPromise();
            return JSON5.parse(config5);
        } catch (e) {
            try {
                const config = await this.http.get(configUrl).toPromise();
                console.log(`Can't parse json5 config: ${e}`);
                return config;
            } catch (e) {
                throw new Error(`Config file not found at: ${configUrl}`);
            }
        }
    }

    protected prepareConfig(config: IConfiguration): Promise<IConfiguration> {
        return Promise.resolve(config);
    }

    cloneRootElem(): any {
        if (this.rootElement instanceof HTMLElement) {
            const clone = this.rootElement.cloneNode(true) as HTMLElement
            const children = Array.from(clone.childNodes);
            children.forEach(child => {
                if (child instanceof HTMLElement) {
                    child.remove();
                }
            });
            return clone;
        }
        return this.rootElement.cloneNode(true);
    }

    prepareUrl(url: string, ending: string): string {
        const project = !this.loadedConfig ? "" : this.loadedConfig.project;
        const needsProtocol = url?.startsWith("//") ?? false;
        url = !needsProtocol && url?.startsWith("/") ? this.loadedConfig.baseDomain + url.substr(1) : url || "";
        url = `${url.replace(/\/+$/, "")}${ending}`.replace("[project]", project);
        return this.universal.isServer && needsProtocol ? `http:${url}` : url;
    }

    getConfigValue(key: string): any {
        return this.loadedConfig[key];
    }

    getQueryParameter(name: string, url?: string): string {
        url = url || (this.universal.isBrowser ? window.location.href : "");
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}
