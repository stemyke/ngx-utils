import {EventEmitter, InjectionToken} from "@angular/core";
import {Data, Route} from "@angular/router";
import {AuthGuard} from "./utils";

// --- Utils
export interface IResolveFactory {
    func: Function;
    type?: any;
    params?: any[];
}

// --- Language service ---
export interface ITranslation {
    lang: string;
    translation: string;
}

export interface ITranslations {
    [key: string]: any;
}

export interface ILanguageService {
    currentLanguage: string;
    getTranslation(key: string, params?: any): Promise<string>;
    getTranslationFromObject(translations: ITranslations, params?: any, lang?: string): string;
    getTranslationFromArray(translations: ITranslation[], params?: any, lang?: string): string;
    getTranslations(...keys: string[]): Promise<ITranslations>;
}

export const LANGUAGE_SERVICE: InjectionToken<ILanguageService> = new InjectionToken<ILanguageService>("language-service");

// --- Auth Service ---
export interface IAuthService {
    isAuthenticated: boolean;
    userChanged: EventEmitter<any>;
    checkAuthenticated(): Promise<boolean>;
}

export type RouteValidator = (auth: IAuthService) => Promise<boolean>;

export interface IRoute extends Route {
    data?: IRouteData;
}

export interface IRouteData extends Data {
    returnState?: string[];
    guards?: Array<IResolveFactory | RouteValidator>;
}

export const AUTH_SERVICE: InjectionToken<IAuthService> = new InjectionToken<IAuthService>("auth-service");

// --- Acl Service ---
export interface IAclComponent {
    onUserInitialized(): void;
    onUserChanged(): void;
}

export interface IRouteStateInfo {
    route: IRoute;
    component: any;
    guard: AuthGuard;
    dirty: boolean;
    first: boolean;
}

// --- Toaster Service ---
export interface IToasterService {
    error(message: string, params?: any, title?: string): void;
    info(message: string, params?: any, title?: string): void;
    success(message: string, params?: any, title?: string): void;
    warning(message: string, params?: any, title?: string): void;
}

export const TOASTER_SERVICE: InjectionToken<IToasterService> = new InjectionToken<IToasterService>("toaster-service");

// --- Async method ---
export interface IAsyncMessage {
    message: string;
    context?: any;
}

export type AsyncMethod = () => Promise<IAsyncMessage>;
