import {ElementRef, EventEmitter, InjectionToken, Injector, NgZone, Provider, TemplateRef, Type} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {ActivatedRouteSnapshot, Data, LoadChildrenCallback, Route, Routes, UrlTree} from "@angular/router";
import {Request} from "express";
import {ReflectUtils} from "./utils/reflect.utils";
import {ObjectUtils} from "./utils/object.utils";

// --- Util
export interface TypedFactoryProvider<T> {
    useFactory: (...args: any[]) => T;
    deps: any[];
}

export interface TypedValueProvider<T> {
    useValue: T;
}

export type CachedProvider<T> = Type<T> | TypedFactoryProvider<T> | TypedValueProvider<T>;

export type CachedFactory<T> = (injector: Injector) => ReadonlyArray<T>;

export const OPTIONS_TOKEN = new InjectionToken("custom-options-token");

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
    isDisabled: boolean;
    iconsLoaded: EventEmitter<any>;
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

export interface ILanguageSetting {
    unavailable?: string;
    [key: string]: string | boolean | number;
}

export interface ILanguageSettings {
    languages: string[];
    devLanguages: string[];
    defaultLanguage: string;
    settings?: {[lang: string]: ILanguageSetting};
}

export interface ILanguageService {
    currentLanguage: string;
    editLanguage: string;
    disableTranslations: boolean;
    defaultLanguage: string;
    dictionary: ITranslations;
    readonly languages: ReadonlyArray<string>;
    readonly httpClient: HttpClient;
    replaceLanguages(languages: string[]): void;
    addLanguages(languages: string[]): void;
    getTranslationSync(key: string, params?: Object): string;
    getTranslation(key: string, params?: Object): Promise<string>;
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

export type RouteValidator = (auth: IAuthService, route?: IRoute, next?: ActivatedRouteSnapshot) => Promise<boolean>;

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
    guard: any;
    dirty: boolean;
    first: boolean;
    component?: any;
}

// --- State Service ---
export type NavigationUrlParam = any[] | string | UrlTree;

// --- Storage Service ---
export enum StorageMode {
    Local,
    Session
}

// --- Toaster Service ---
export type ToastType = "info" | "success" | "warning" | "error";

export interface IToasterService {
    error(message: string, params?: any): void;
    info(message: string, params?: any): void;
    success(message: string, params?: any): void;
    warning(message: string, params?: any): void;
    handleAsyncMethod(method: AsyncMethod, context?: any): void
}

export const TOASTER_SERVICE: InjectionToken<IToasterService> = new InjectionToken<IToasterService>("toaster-service");

// --- Dialog service ---
export interface IDialogButtonConfig {
    icon?: string;
    text?: string;
    classes?: string;
    method?: AsyncMethod;
}

export interface IDialogConfig {
    id?: string;
    title?: string;
    message: string;
    messageContext?: any;
    buttons?: IDialogButtonConfig[];
    onClose?: AsyncMethod;
    size?: string;
    type?: string;
    templates?: { [id: string]: TemplateRef<any> };
}

export interface IConfirmDialogConfig {
    id?: string;
    title?: string;
    message: string;
    messageContext?: any;
    buttons?: IDialogButtonConfig[];
    method?: AsyncMethod;
    cancelMethod?: AsyncMethod;
    size?: string;
    templates?: { [id: string]: TemplateRef<any> };
    okText?: string;
    okClasses?: string;
    cancelText?: string;
    cancelClasses?: string;
}

export interface IDialogService<DR = any> {
    dialog(config: IDialogConfig): DR;
    confirm(config: IConfirmDialogConfig): DR
}

export const DIALOG_SERVICE = new InjectionToken<IDialogService>("dialog-service");

// --- Socket service ---

export const SOCKET_IO_PATH = new InjectionToken<string>("socket-io-path");

// --- Promise Service ---

export interface IPromiseService {
    zone: NgZone;
    count: number;
    onChanged: EventEmitter<number>;
    create<T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    all(promises: Promise<any>[]): Promise<any>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    reject<T>(value: T | PromiseLike<T>): Promise<T>;
}

export const PROMISE_SERVICE = new InjectionToken<IPromiseService>("promise-service");

// --- Wasm service ---
export type TypedArray =
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export interface IWasmExports {
    HEAP8: Int8Array;
    HEAP16: Int16Array,
    HEAP32: Int32Array,
    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array,
    HEAPU32: Uint32Array,
    HEAPF32: Float32Array,
    HEAPF64: Float64Array,
    memory: WebAssembly.Memory;
    [key: string]: any;
}

export interface IWasi {
    instantiate(bytes: ArrayBuffer): Promise<IWasmExports>;
}

export interface IWasm {
    writeArrayToMemory(array: TypedArray): Promise<number> | number;
    readArrayFromMemory<T = TypedArray>(pointer: number, array: T): Promise<T> | T;
    [key: string]: (...args: any[]) => any;
}

export interface IWasmAsync {
    writeArrayToMemory(array: TypedArray): Promise<number>;
    readArrayFromMemory<T = TypedArray>(pointer: number, array: T): T;
    [key: string]: (...args: any[]) => Promise<any>;
}

export const WASI_IMPLEMENTATION = new InjectionToken<Type<IWasi>>("wasi-implementation");

// --- Async method ---
export interface IAsyncMessage {
    message: string;
    context?: any;
}

export type AsyncMethod = (context?: any, ev?: MouseEvent) => Promise<IAsyncMessage>;

// --- Dropdown ---
export type DropdownAttachTo = "root" | HTMLElement | ElementRef<HTMLElement> | null;

// --- Unordered list ---
export interface UnorderedListTemplate {
    readonly type: string;
    readonly selector: string;
    readonly templateRef: TemplateRef<any>
}

export interface UnorderedListTemplates {
    [type: string]: TemplateRef<any>;
}

export type UnorderedListStyle = "table" | "list";

// --- Upload ---

export type UploadType = string | Blob;

export interface IFileUploadResult {
    _id?: string;
    id?: string;
    contentType?: string;
    createdAt?: Date;
    filename?: string;
    file?: Blob;
}

export interface IFileUploadProcess {
    file: File;
    progress: number;
    preview?: string;
    promise?: Promise<void>;
}

// --- Ajax request  ---
export interface IAjaxRequestDetails {
    request: XMLHttpRequest,
    method: string;
    url: string;
}

export type AjaxRequestCallback = (details: IAjaxRequestDetails, params: any) => void;

// --- Loader utils ---
export type ScriptType = "text/javascript" | "module";

export interface ILoadableElement extends HTMLElement {
    readyState?: string;
    onreadystatechange?: Function;
}

export interface ILoaderPromises<T extends ILoadableElement> {
    [src: string]: {
        elem: T;
        promise: Promise<T>;
    }
}

// --- Observable utils ---
export interface ISearchObservable {
    search: string;
    getSearchResults(token: string): Promise<any[]>;
}

// --- Reflect utils ---
export function FactoryDependencies(...dependencies: Array<InjectionToken<any> | Provider>): MethodDecorator {
    return function (target: any, method: string): void {
        ReflectUtils.defineMetadata("factoryDependencies", dependencies, target, method);
    };
}

export function ObjectType(type: string): ClassDecorator {
    return function (target: any): void {
        ReflectUtils.defineMetadata("objectType", type, target);
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
export interface IPageInfo {
    text: string;
    number: number;
    active: boolean;
}

export interface IPaginationData {
    total: number;
    items: any[];
    meta?: any;
}

export type PaginationDataLoader = (page: number, itemsPerPage: number) => Promise<IPaginationData>;

export class PaginationItemContext {

    constructor(public item: any, public parallelItem: any, public count: number, public index: number, public dataIndex: number) {
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

    // Support for old dynamic table implementation
    get row(): any {
        console.log("DynamicTable row is deprecated use item instead");
        return this.item;
    }

    // Support for old dynamic table implementation
    get parallelRow(): any {
        console.log("DynamicTable parallelRow is deprecated use parallelItem instead");
        return this.parallelItem;
    }

    filter(filterRx: RegExp): boolean {
        const keys = Object.keys(this.item);
        for (const key of keys) {
            const value = this.item[key];
            if (ObjectUtils.isNullOrUndefined(value) || ObjectUtils.isObject(value)) continue;
            const testValue = ObjectUtils.isString(value) ? value : value.toString();
            if (testValue.match(filterRx)) return true;
        }
        return false;
    }
}

// --- Geometry ---
export interface IPoint {
    readonly x: number;
    readonly y: number;
}

export interface IShape extends IPoint {
    distance(shape: IPoint): number;
}

// --- Interactive canvas ---

export type CanvasItemShape = "rect" | "circle";

export type CanvasItemDirection = "horizontal" | "vertical" | "free" | "none";

export interface InteractiveCanvas {
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly ratio: number;
    readonly fullHeight: number;
    readonly ctx: CanvasRenderingContext2D;
}

export interface InteractiveCanvasItem {
    readonly position: IPoint;
    readonly shape: CanvasItemShape;
    readonly shapes: ReadonlyArray<IShape>;
    readonly active: boolean;
    readonly index: number;
    draw(ctx: CanvasRenderingContext2D, scale?: number): void;
}

export type InteractiveDrawFn = (ctx: InteractiveCanvas, items: ReadonlyArray<InteractiveCanvasItem>)
    => void | Promise<void>;

export interface InteractivePanEvent {
    pointers?: any[];
    deltaX?: number;
    deltaY?: number;
    item?: InteractiveCanvasItem;
    [key: string]: any;
}

export interface InteractiveCanvasPointer {
    clientX: number;
    clientY: number;
}


// --- Http service ---
export interface IHttpHeaders {
    [header: string]: string | string[];
}

export interface IHttpParams {
    [key: string]: any;
}

export interface IRequestOptions {
    method?: string;
    body?: any;
    headers?: IHttpHeaders | HttpHeaders;
    originalHeaders?: IHttpHeaders;
    params?: IHttpParams;
    observe?: "body" | "response";
    reportProgress?: boolean;
    responseType?: "arraybuffer" | "blob" | "json" | "text";
    withCredentials?: boolean;
    timeout?: number;
}

export interface IIssueContext {
    url: string;
}

export interface IProgress {
    percentage?: number;
    loaded?: number;
    total?: number;
}

export type ProgressListener = (progress: IProgress) => void;

export type PromiseExecutor = (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => void;

export class HttpPromise extends Promise<any> {

    protected rejectHandler: (reason?: HttpErrorResponse) => void;
    protected hasRejectHandler: boolean;
    protected attachCount: number;
    protected runCount: number;

    constructor(rejectHandler: (reason?: HttpErrorResponse) => void, executor: PromiseExecutor) {
        super(executor);
        this.rejectHandler = rejectHandler;
        this.attachCount = 0;
        this.runCount = 0;
    }

    then<TResult1, TResult2>(onFulfilled?: ((value: any) => (PromiseLike<TResult1> | TResult1)) | null | undefined,
                             onRejected?: ((reason: HttpErrorResponse) => (PromiseLike<TResult2> | TResult2)) | null | undefined): Promise<TResult1 | TResult2> {
        this.attachCount++;
        return super.then(value => {
            this.runCount++;
            return onFulfilled ? onFulfilled(value) : null;
        }, (reason: HttpErrorResponse) => {
            const result: any = onRejected ? onRejected(reason) : null;
            this.hasRejectHandler = this.hasRejectHandler || (onRejected && result !== false);
            this.runCount++;
            this.rejectHandler(this.runCount == this.attachCount && !this.hasRejectHandler ? reason : null);
            return result;
        });
    }

    catch<TResult = never>(onRejected?: ((reason: HttpErrorResponse) => (PromiseLike<TResult> | TResult)) | null | undefined): Promise<any | TResult> {
        return this.then(null, onRejected);
    }
}

export interface IHttpService {
    language: ILanguageService;
    url(url: string): string;
    makeListParams(page: number, itemsPerPage: number, orderBy?: string, orderDescending?: boolean, filter?: string): IHttpParams;
}

export const EXPRESS_REQUEST = new InjectionToken<Request>("express-request");

// --- Api service ---

export interface IBaseHttpClient extends HttpClient {
    readonly requestHeaders: IHttpHeaders;
    readonly requestParams: IHttpParams;
}

export interface IApiService extends IHttpService {
    cache: any;
    client: IBaseHttpClient;
    get(url: string, options?: IRequestOptions): Promise<any>;
    delete(url: string, options?: IRequestOptions): Promise<any>;
    post(url: string, body?: any, options?: IRequestOptions): Promise<any>;
    put(url: string, body?: any, options?: IRequestOptions): Promise<any>;
    patch(url: string, body?: any, options?: IRequestOptions): Promise<any>;
    upload(url: string, body: any, listener?: ProgressListener, options?: IRequestOptions): Promise<any>;
    list(url: string, params: IHttpParams): Promise<IPaginationData>;
}

export const API_SERVICE: InjectionToken<IApiService> = new InjectionToken<IApiService>("api-service");

// --- OpenApi service ---
export interface IOpenApiSchemaProperty {
    id: string;
    type?: string;
    format?: string;
    column?: boolean;
    additionalProperties?: any;
    $ref?: string;
    allOf?: ReadonlyArray<{$ref?: string}>
    items?: IOpenApiSchemaProperty;
    enum?: string[];
    [key: string]: any;
}

export interface IOpenApiSchema {
    properties: {
        [name: string]: IOpenApiSchemaProperty;
    };
    required: string[];
}

export interface IOpenApiSchemas {
    [name: string]: IOpenApiSchema;
}

// --- Dynamic table ---
export type TableFilterType = "text" | "enum" | "checkbox";

export interface ITableOrders {
    [column: string]: string;
}

export interface ITableColumn {
    title?: string;
    sort?: string;
    filter?: boolean;
    filterType?: TableFilterType;
    enum?: string[];
    enumPrefix?: string;
    [key: string]: any;
}

export interface ITableColumns {
    [column: string]: ITableColumn;
}

export type TableColumns = ITableOrders | ITableColumns | string[];

export interface ITableTemplate {
    column: string | string[];
    pure: boolean;
    ref: TemplateRef<any>;
}

export interface ITableTemplates {
    [column: string]: ITableTemplate;
}

export interface ITableDataQuery {
    [column: string]: string | string[] | boolean;
}

export type TableDataLoader = (
    page: number, rowsPerPage: number, orderBy: string, orderDescending: boolean,
    filter: string, query: ITableDataQuery
) => Promise<IPaginationData>;

export type DragDropEvent<K extends string = "item", T = any> = {
    [key in K]: T;
} & {
    ev: DragEvent;
    elem: HTMLElement;
    source?: T;
};

export type DragEventHandler<R = boolean, K extends string = "item"> = (ev: DragDropEvent<K>) => R;

// Back compatibility
export type ITableDragEvent = DragDropEvent;
export type DynamicTableDragHandler<R = boolean> = DragEventHandler<R>;

// --- Resource if ---
export class ResourceIfContext {
    resource: string;
    url: string;
}

// --- ComponentLoaderService ---

export type CssSelector = [tagName: string, attrName?: string, attrValue?: string];

export type CssSelectorList = CssSelector[];

export interface DynamicModuleInfo {
    moduleId: string;
    loadChildren: LoadChildrenCallback;
    routes?: Routes;
    initialNavigation?: boolean;
}

export interface DynamicComponentLocation {
    moduleId: string;
    selector: string;
}

export interface DynamicEntryComponents {
    components: Type<any>[];
    moduleId: string;
}

export const DYNAMIC_ENTRY_COMPONENTS = new InjectionToken<DynamicEntryComponents[]>("dynamic-entry-components");

export const DYNAMIC_MODULE_INFO = new InjectionToken<DynamicModuleInfo[]>("dynamic-module-info");

// --- ConfigService ---
export const APP_BASE_URL = new InjectionToken<string>("app-base-url");

export class IConfiguration {
    cdnUrl?: string;
    baseUrl?: string;
    baseDomain?: string;
    translationUrl?: string;
    translationExt?: string;
    [key: string]: any;
}

export interface IConfigService {
    readonly config: IConfiguration;
    readonly injector: Injector;
    readonly load: () => Promise<IConfiguration>;
    readonly rootElement: any;
    cloneRootElem(): any;
    prepareUrl(url: string, ending: string): string;
    getConfigValue(key: string): any;
    getQueryParameter(name: string, url?: string): string;
}

export const CONFIG_SERVICE = new InjectionToken<IConfigService>("config-service");

export const BASE_CONFIG = new InjectionToken<IConfiguration>("base-config");

export const SCRIPT_PARAMS = new InjectionToken<any>("script-params");

export const ROOT_ELEMENT = new InjectionToken<HTMLElement>("app-root-element");

export const RESIZE_DELAY = new InjectionToken<number>("resize-event-delay");

export type ResizeEventStrategy = "scroll" | "object" | "observer";

export const RESIZE_STRATEGY = new InjectionToken<ResizeEventStrategy>("resize-event-strategy");

// --- Error handler service ---
export type ErrorHandlerCallback = (error: string) => any;

export const ERROR_HANDLER = new InjectionToken<ErrorHandlerCallback>("error-handler-callback");

// --- Global templates service

export type GlobalComponentModifier = (component: any) => any;

// --- Module ---
export type AppInitializerFunc = () => Promise<void> | void;

export interface IModuleConfig {
    apiService?: Type<IApiService>
    authService?: Type<IAuthService>;
    iconService?: Type<IIconService>;
    languageService?: Type<ILanguageService>;
    toasterService?: Type<IToasterService>;
    promiseService?: Type<IPromiseService>;
    configService?: Type<IConfigService>;
    dialogService?: Type<IDialogService>;
    wasiImplementation?: Type<IWasi>;
    initializeApp?: (injector: Injector) => AppInitializerFunc;
    baseUrl?: (injector: Injector) => string;
    resizeDelay?: number;
    resizeStrategy?: ResizeEventStrategy;
    socketPath?: string;
}

// --- Valued promise ---
export class ValuedPromise<T> extends Promise<T> {
    value: T;
}
