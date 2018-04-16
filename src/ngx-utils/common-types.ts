import {Data, Route} from "@angular/router";
import {InjectionToken} from "@angular/core";

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
    checkAuthenticated(): Promise<boolean>;
    getReturnState(route: IRoute): string[];
}

export type RouteValidator = (auth: IAuthService) => Promise<boolean>;

export interface IRoute extends Route {
    data?: IRouteData;
}

export interface IRouteData extends Data {
    returnState?: string[];
    guards?: Array<IResolveFactory | RouteValidator>;
}

export const AUTH_SERVICE: InjectionToken<IAuthService> = new InjectionToken<IAuthService>("language-service");
