import {APP_INITIALIZER, Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {
    API_SERVICE,
    AUTH_SERVICE,
    CONFIG_SERVICE,
    GLOBAL_TEMPLATES,
    ICON_SERVICE,
    IModuleConfig,
    LANGUAGE_SERVICE,
    PROMISE_SERVICE,
    ROOT_ELEMENT,
    TOASTER_SERVICE
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
                    provide: ROOT_ELEMENT,
                    useValue: null
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: (!config ? null : config.initializeApp) || loadConfig,
                    multi: true,
                    deps: [(!config ? null : config.initializeApp) ? Injector : CONFIG_SERVICE]
                }
            ]
        };
    }

    constructor() {

    }
}
