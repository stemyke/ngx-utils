import {InjectionToken, Type} from "@angular/core";
import {Request} from "express";
import {
    ButtonProps,
    DynamicEntryComponents,
    DynamicModuleInfo,
    ErrorHandlerCallback,
    IApiService,
    IAuthService,
    IConfigService,
    IConfiguration,
    IconMap,
    IconProps,
    IDialogService,
    IIconService,
    ILanguageService,
    IPromiseService,
    IToasterService,
    IWasi,
    ResizeEventStrategy
} from "./common-types";

export const ICON_TYPE = new InjectionToken<Type<IconProps>>("icon-component-type");
export const ICON_MAP = new InjectionToken<IconMap>("icon-map");
export const BUTTON_TYPE = new InjectionToken<Type<ButtonProps>>("button-component-type");
export const OPTIONS_TOKEN = new InjectionToken("custom-options-token");
export const ICON_SERVICE: InjectionToken<IIconService> = new InjectionToken<IIconService>("icon-service");
export const LANGUAGE_SERVICE: InjectionToken<ILanguageService> = new InjectionToken<ILanguageService>("language-service");
export const AUTH_SERVICE: InjectionToken<IAuthService> = new InjectionToken<IAuthService>("auth-service");
export const TOASTER_SERVICE: InjectionToken<IToasterService> = new InjectionToken<IToasterService>("toaster-service");
export const DIALOG_SERVICE = new InjectionToken<IDialogService>("dialog-service");
export const SOCKET_IO_PATH = new InjectionToken<string>("socket-io-path");
export const PROMISE_SERVICE = new InjectionToken<IPromiseService>("promise-service");
export const WASI_IMPLEMENTATION = new InjectionToken<Type<IWasi>>("wasi-implementation");
export const EXPRESS_REQUEST = new InjectionToken<Request>("express-request");
export const API_SERVICE: InjectionToken<IApiService> = new InjectionToken<IApiService>("api-service");
export const DYNAMIC_ENTRY_COMPONENTS = new InjectionToken<DynamicEntryComponents[]>("dynamic-entry-components");
export const DYNAMIC_MODULE_INFO = new InjectionToken<DynamicModuleInfo[]>("dynamic-module-info");
export const APP_BASE_URL = new InjectionToken<string>("app-base-url");
export const CONFIG_SERVICE = new InjectionToken<IConfigService>("config-service");
export const BASE_CONFIG = new InjectionToken<IConfiguration>("base-config");
export const SCRIPT_PARAMS = new InjectionToken<any>("script-params");
export const ROOT_ELEMENT = new InjectionToken<HTMLElement>("app-root-element");
export const RESIZE_DELAY = new InjectionToken<number>("resize-event-delay");
export const RESIZE_STRATEGY = new InjectionToken<ResizeEventStrategy>("resize-event-strategy");
export const ERROR_HANDLER = new InjectionToken<ErrorHandlerCallback>("error-handler-callback");
