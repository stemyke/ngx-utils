import {APP_INITIALIZER, Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {APP_BASE_HREF, CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {
    API_SERVICE,
    APP_BASE_URL,
    AUTH_SERVICE,
    CONFIG_SERVICE,
    GLOBAL_TEMPLATES,
    ICON_SERVICE,
    IModuleConfig,
    LANGUAGE_SERVICE,
    PROMISE_SERVICE, RESIZE_DELAY,
    ROOT_ELEMENT,
    TOASTER_SERVICE,
    WASI_IMPLEMENTATION
} from "./common-types";
import {components, directives, loadConfig, pipes, providers} from "./ngx-utils.imports";
import {ApiService} from "./services/api.service";
import {StaticAuthService} from "./services/auth.service";
import {IconService} from "./services/icon.service";
import {StaticLanguageService} from "./services/static-language.service";
import {ConsoleToasterService} from "./services/toaster.service";
import {PromiseService} from "./services/promise.service";
import {ConfigService} from "./services/config.service";
import {GlobalTemplateService} from "./services/global-template.service";
import {Wasi} from "./utils/wasi";

export function loadBaseUrl(): string {
    if (typeof (document) === "undefined" || typeof (location) === "undefined") return "/";
    const scripts = Array.from(document.scripts);
    const currentScript = (document.currentScript as HTMLScriptElement);
    let currentUrl = new URL(currentScript?.src ?? "http://localhost:4200/");
    if (!currentScript) {
        try {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        } catch (e) {
            const qualifiedUrl = location.protocol + "//" + location.host;
            const stack = (e.stack || "") as string;
            const srcUrl = (stack.match(new RegExp(qualifiedUrl + ".*?\\.js", "g")) || stack.match(/http([A-Z:\/\-.]+)\.js/gi)).shift();
            currentUrl = new URL(srcUrl ?? "");
        }
    }
    const mainScript = scripts.find(s => {
        if (!s.src) return false;
        const sUrl = new URL(s.src);
        return currentUrl.host === sUrl.host && sUrl.pathname.includes("main");
    });
    const scriptUrl = !mainScript ? currentUrl : new URL(mainScript.src);
    const path = scriptUrl.pathname?.split("/") ?? [];
    path.pop();
    return `${scriptUrl.protocol}//${scriptUrl.host}${path.join("/")}/`;
}

export function loadBaseHref(baseUrl: string): string {
    try {
        return new URL(baseUrl).pathname;
    } catch (e) {
        console.log(e);
        return "/";
    }
}

@NgModule({
    declarations: [
        ...pipes,
        ...directives,
        ...components
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        ...pipes,
        ...directives,
        ...components,
        FormsModule
    ],
    providers: pipes
})
export class NgxUtilsModule {

    static forRoot(config?: IModuleConfig): ModuleWithProviders<NgxUtilsModule> {
        return {
            ngModule: NgxUtilsModule,
            providers: [
                ...providers,
                {
                    provide: API_SERVICE,
                    useExisting: (!config ? null : config.apiService) || ApiService
                },
                {
                    provide: AUTH_SERVICE,
                    useExisting: (!config ? null : config.authService) || StaticAuthService
                },
                {
                    provide: ICON_SERVICE,
                    useExisting: (!config ? null : config.iconService) || IconService
                },
                {
                    provide: LANGUAGE_SERVICE,
                    useExisting: (!config ? null : config.languageService) || StaticLanguageService
                },
                {
                    provide: TOASTER_SERVICE,
                    useExisting: (!config ? null : config.toasterService) || ConsoleToasterService
                },
                {
                    provide: PROMISE_SERVICE,
                    useExisting: (!config ? null : config.promiseService) || PromiseService
                },
                {
                    provide: CONFIG_SERVICE,
                    useExisting: (!config ? null : config.configService) || ConfigService
                },
                {
                    provide: GLOBAL_TEMPLATES,
                    useExisting: (!config ? null : config.globalTemplates) || GlobalTemplateService
                },
                {
                    provide: WASI_IMPLEMENTATION,
                    useExisting: (!config ? null : config.wasiImplementation) || Wasi
                },
                {
                    provide: APP_BASE_URL,
                    useFactory: (!config ? null : config.baseUrl) || loadBaseUrl,
                    deps: [Injector]
                },
                {
                    provide: ROOT_ELEMENT,
                    useValue: null
                },
                {
                    provide: RESIZE_DELAY,
                    useValue: (!config ? null : config.resizeDelay) ?? 200,
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: (!config ? null : config.initializeApp) || loadConfig,
                    multi: true,
                    deps: [(!config ? null : config.initializeApp) ? Injector : CONFIG_SERVICE]
                },
                {
                    provide: APP_BASE_HREF,
                    useFactory: loadBaseHref,
                    deps: [APP_BASE_URL]
                }
            ]
        };
    }

    constructor() {

    }
}
