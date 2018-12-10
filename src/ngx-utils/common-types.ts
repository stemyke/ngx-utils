import {EmbeddedViewRef, EventEmitter, InjectionToken, TemplateRef, TypeProvider} from "@angular/core";
import {Data, Route} from "@angular/router";
import {ReflectUtils} from "./utils/reflect.utils";

// --- Utils
export interface IResolveFactory {
    func: Function;
    type?: any;
    params?: any[];
}

export class CanvasColor {
    constructor(public r: number, public g: number, public b: number, public a: number = 255) {

    }
}

// --- Icon service ---
export interface IIconService {
    getIcon(icon: string, activeIcon: string, active: boolean): Promise<string>;
}

export const ICON_SERVICE: InjectionToken<IIconService> = new InjectionToken<IIconService>("icon-service");

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
    editLanguage: string;
    defaultLanguage: string;
    dictionary: any;
    addLanguages(languages: string[]): void;
    getTranslation(key: string, params?: any): Promise<string>;
    getTranslations(...keys: string[]): Promise<ITranslations>;
    getTranslationFromObject(translations: ITranslations, params?: any, lang?: string): string;
    getTranslationFromArray(translations: ITranslation[], params?: any, lang?: string): string;
}

export const LANGUAGE_SERVICE: InjectionToken<ILanguageService> = new InjectionToken<ILanguageService>("language-service");

// --- Auth Service ---
export interface IAuthService {
    isAuthenticated: boolean;
    userChanged: EventEmitter<any>;
    checkAuthenticated(): Promise<boolean>;
}

export type RouteValidator = (auth: IAuthService) => Promise<boolean>;

export interface IRouteData extends Data {
    returnState?: string[];
    guards?: Array<IResolveFactory | RouteValidator>;
}

export interface IRoute extends Route {
    data?: IRouteData;
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
    guard: any;
    dirty: boolean;
    first: boolean;
}

// --- Storage Service ---
export enum StorageMode {
    Local,
    Session
}

// --- Toaster Service ---
export interface IToasterService {
    error(message: string, params?: any, title?: string): void;
    info(message: string, params?: any, title?: string): void;
    success(message: string, params?: any, title?: string): void;
    warning(message: string, params?: any, title?: string): void;
}

export const TOASTER_SERVICE: InjectionToken<IToasterService> = new InjectionToken<IToasterService>("toaster-service");

// --- Promise Service ---

export interface IPromiseService {
    promises: Promise<any>[];
    create<T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    all(promises: Promise<any>[]): Promise<any>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
}

export const PROMISE_SERVICE = new InjectionToken<IPromiseService>("promise-service");

// --- Async method ---
export interface IAsyncMessage {
    message: string;
    context?: any;
}

export type AsyncMethod = () => Promise<IAsyncMessage>;

// --- Unordered list ---
export abstract class UnorederedListTemplate extends TemplateRef<any> {
    abstract type: string;
    abstract selector: string;
}

export interface UnorderedListTemplates {
    [type: string]: TemplateRef<any>;
}

export type UnorderedListStyle = "table" | "list";

// --- Ajax request  ---
export interface IAjaxRequestDetails {
    request: XMLHttpRequest,
    method: string;
    url: string;
}

export type AjaxRequestCallback = (details: IAjaxRequestDetails, params: any) => void;

// --- Loader utils ---
export interface IScriptPromises {
    [src: string]: Promise<HTMLScriptElement>;
}
export interface IStylePromises {
    [src: string]: Promise<HTMLLinkElement>;
}

// --- Observable utils ---
export interface ISearchObservable {
    search: string;
    getSearchResults(token: string): Promise<any[]>;
}

// --- Reflect utils ---
export function FactoryDependencies(...dependencies: TypeProvider[]): MethodDecorator {
    return function (target: any, method: string): void {
        ReflectUtils.defineMetadata("factoryDependencies", dependencies, target, method);
    };
}

// --- Timer utils ---
export interface ITimer {
    id?: any;
    func?: Function;
    time?: number;
    run?: () => void;
    set?: (func: Function, time: number) => void;
    clear?: () => void;
}

// --- ExtraItemProperties ---
export interface IExtraProperties {
    [prop: string]: any;
}

// --- Group by ---
export interface IGroupMap {
    [column: string]: any;
}

// --- Translate ---
export type TranslationQuery = string | ITranslations | ITranslation[];

// --- Pagination ---
export interface IPaginationData {
    total: number;
    items: any[];
}

export type PaginationDataLoader = (page: number, itemsPerPage: number) => Promise<IPaginationData>;

export class PaginationItemContext {

    constructor(public item: any, public count: number, public index: number, public dataIndex: number) {
    }

    get first(): boolean {
        return this.index === 0;
    }

    get last(): boolean {
        return this.index === this.count - 1;
    }

    get even(): boolean {
        return this.index % 2 === 0;
    }

    get odd(): boolean {
        return !this.even;
    }
}

// --- Resource if ---
export class ResourceIfContext {
    resource: string;
    url: string;
}
