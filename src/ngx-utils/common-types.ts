import {Data, Route} from "@angular/router";
import {EventEmitter, InjectionToken} from "@angular/core";
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
    getTranslationFromObject(translations: ITranslations, params?: any): string;
    getTranslationFromArray(translations: ITranslation[], params?: any): string;
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
