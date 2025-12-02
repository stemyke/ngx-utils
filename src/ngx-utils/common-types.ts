import {ElementRef, EventEmitter, InjectionToken, Injector, NgZone, Provider, TemplateRef, Type} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRouteSnapshot, Data, LoadChildrenCallback, Route, Routes, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {DurationLikeObject} from "luxon";

import {MaybePromise, StringKeys} from "./helper-types";

// --- Util
export type DurationUnit = StringKeys<DurationLikeObject>;

export interface TypedFactoryProvider<T> {
    provide?: any;
    useFactory: (...args: any[]) => T;
    deps: any[];
}

export interface TypedValueProvider<T> {
    provide?: any;
    useValue: T;
}

export interface TypedExistingProvider<T> {
    provide?: any;
    useExisting: Type<T>;
}

export interface TypedClassProvider<T> {
    provide?: any;
    useClass: Type<T>;
}

export interface TypedTokenProvider<T> {
    provide?: any;
    useToken: InjectionToken<T>;
}

export type TypedProvider<T> = TypedFactoryProvider<T> | TypedValueProvider<T> |
    TypedExistingProvider<T> | TypedClassProvider<T> | TypedTokenProvider<T> | Type<T>;

export type CachedFactory<T> = (injector: Injector) => ReadonlyArray<T>;

export interface ResolveFactory<T = any> {
    type?: Function;
    func: (...args: any[]) => T;
    params?: any[];
}

export interface IResolveFactory extends Omit<ResolveFactory, "func"> {
    func: Function;
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
    getIconUrl(icon: string, modifier?: SvgSourceModifier): Promise<string>;
    getIconImage(icon: string, modifier?: SvgSourceModifier): Promise<HTMLImageElement>;
}

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
    enableTranslations: boolean;
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

// --- Auth Service ---
export interface IUserData {
    _id?: string;
    id?: string;
    email?: string;
    [key: string]: any;
}

export interface IAuthService {
    isAuthenticated: boolean;
    checkAuthenticated(): Promise<boolean>;
}

export type RouteValidator = (auth: IAuthService, route?: IRoute, next?: ActivatedRouteSnapshot) => Promise<boolean>;

export interface IRouteData extends Data {
    returnState?: string[];
    guards?: Array<ResolveFactory<RouteValidator> | RouteValidator>;
}

export interface IRoute extends Route {
    data?: IRouteData;
}

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

// --- Dialog service ---
export interface IDialogButtonConfig {
    icon?: string;
    text?: string;
    classes?: string;
    method?: AsyncMethod;
    testId?: string;
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

export interface IConfirmMessageConfig {
    id?: string;
    title?: string;
    messageContext?: any;
    size?: string;
    templates?: { [id: string]: TemplateRef<any> };
    okText?: string;
    okClasses?: string;
    cancelText?: string;
    cancelClasses?: string;
}

export interface IConfirmDialogConfig extends IConfirmMessageConfig {
    message: string;
    method?: AsyncMethod;
    cancelMethod?: AsyncMethod;
}

export interface IDialogService<DR = any> {
    dialog(config: IDialogConfig): DR;
    confirm(config: IConfirmDialogConfig): DR;
    confirmMsg(message: string, config?: IConfirmMessageConfig): Promise<boolean>;
}

// --- Socket service ---

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

// --- Async method ---
export interface IAsyncMessage {
    message: string;
    context?: any;
}

export type AsyncMethod = (context?: any, ev?: MouseEvent) => Promise<IAsyncMessage>;

// --- Icon ---
export interface IconMap {
    [key: string]: string;
}

export interface IconProps {
    name: string;
}

// --- Button ---

export type ButtonType = "primary" | "secondary" | "transparent";

export type ButtonSize = "normal" | "small";

export interface ButtonProps {
    label: string;
    tooltip: string;
    icon: string;
    disabled: boolean;
    type: ButtonType;
    size: ButtonSize;
}

// --- Tabs ---

export type TabValue = string | number;

export interface TabOption extends Omit<Partial<ButtonProps>, "size" | "state" | "style"> {
    value: TabValue;
    classes?: string | string[];
}

// --- Chips ---
export type ChipValue = string | number;

export type ChipStatus = "valid" | "invalid";

export interface ChipOption {
    label: string;
    value?: ChipValue;
    classes?: string;
    disabled?: boolean;
    picture?: string;
    group?: ChipOption[];
}

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
        Reflect.defineMetadata("factoryDependencies", dependencies, target, method);
    };
}

export function ObjectType(type: string): ClassDecorator {
    return function (target: any): void {
        Reflect.defineMetadata("objectType", type, target);
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

    constructor(readonly item: any,
                readonly parallelItem: any,
                readonly count: number,
                public index: number,
                public dataIndex: number) {
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
}

// --- Geometry ---
export interface IPoint {
    readonly x: number;
    readonly y: number;
}

export interface ShapeIntersection {
    hit: boolean;
    pa?: IPoint;
    pb?: IPoint;
    point?: IPoint;
}

export interface ShapeDistance {
    distance: number;
    pa?: IPoint;
    pb?: IPoint;
}

export interface IShape extends IPoint {
    readonly center: IPoint;
    draw(ctx: CanvasRenderingContext2D, ratio?: number): void;
    support(dir: IPoint): IPoint;
    move(pos: IPoint): IShape;
    intersection(shape: IShape): ShapeIntersection;
    intersects(shape: IShape): boolean;
    minDistance(shape: IShape): ShapeDistance;
    distance(shape: IShape): number;
}

// --- Interactive canvas ---

export type CanvasResizeMode = "fit" | "fill";

export type CanvasItemDirection = "horizontal" | "vertical" | "free" | "none";

export type CanvasPaintFunc = (ctx: CanvasRenderingContext2D) => MaybePromise<GlobalCompositeOperation | null>;

export type RangeCoords = [from: number, to: number];

export interface RectCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Rectangle frame interface
 */
export interface Frame extends IShape {
    width: number;
    height: number;
    rotation: number;
}

/**
 * Interface for an interactive canvas params
 */
export interface InteractiveCanvasParams {
    xRange?: RangeCoords;
    yRange?: RangeCoords;
    excludedAreas?: ReadonlyArray<RectCoords>;
    [key: string]: any;
}

/**
 * Interface for an interactive canvas item
 */
export interface InteractiveCanvasItem {
    readonly position: IPoint;
    readonly frame: Frame;
    readonly shapes: ReadonlyArray<IShape>;
    readonly isValid: boolean;
    readonly validPosition: IPoint;
    readonly hovered: boolean;
    readonly selected: boolean;
    readonly active: boolean;
    readonly canvas: InteractiveCanvas;
    readonly index: number;
    readonly canvasParams: InteractiveCanvasParams;
    draw(ctx: CanvasRenderingContext2D, shape: IShape): MaybePromise<void>;
}

export type InteractiveCanvasItems = ReadonlyArray<InteractiveCanvasItem>;

/**
 * Interface for an interactive canvas component
 * Some properties are optional for compatibility with other kind of renderer functions
 */
export interface InteractiveCanvas {
    // --- Getters ---
    readonly isInfinite?: boolean;
    readonly realWidth?: number;
    readonly realHeight?: number;
    readonly items?: InteractiveCanvasItems;
    readonly canvas: HTMLCanvasElement;
    readonly lockedItem?: InteractiveCanvasItem;
    // --- Getters / setters ---
    selectedItem?: InteractiveCanvasItem;
    hoveredItem?: InteractiveCanvasItem;
    // --- Calculated values on changes ---
    readonly xRange?: RangeCoords;
    readonly yRange?: RangeCoords;
    // --- Calculated values on resize ---
    readonly ratio: number;
    readonly styles: CSSStyleDeclaration;
    readonly ctx: CanvasRenderingContext2D;
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly fullHeight: number;
    readonly viewRatio: number;
    // --- Calculated values on rotation ---
    readonly rotation: number;
    readonly basePan: number;
    readonly cycles?: ReadonlyArray<number>;
    readonly excludedAreas?: ReadonlyArray<Frame>;
    // --- Optionals, for back compatibility ---
    rendered?: boolean;
    // --- Functions ---
    tempPaint(cb: CanvasPaintFunc): Promise<void>;
}

export type InteractiveCanvasRenderer = (renderCanvas: InteractiveCanvas, renderCtx: Record<string, any>) => MaybePromise<void>;

export interface InteractivePanEvent {
    canvas: InteractiveCanvas;
    item: InteractiveCanvasItem;
    deltaX?: number;
    deltaY?: number;
    [key: string]: any;
}

export interface InteractiveCanvasPointer {
    clientX: number;
    clientY: number;
}

// --- Http service ---
export interface HttpRequestHeaders {
    [header: string]: string | string[];
}

export interface HttpRequestQuery {
    [key: string]: any;
}

/**
 * Base http request options that get sent to backend
 */
export interface HttpClientRequestOptions {
    method?: string;
    body?: any;
    headers?: HttpRequestHeaders | HttpHeaders;
    originalHeaders?: HttpRequestHeaders;
    params?: HttpRequestQuery;
    observe?: "body" | "response";
    /**
     * Used for uploads
     */
    reportProgress?: boolean;
    /**
     * Specifies the type of response
     */
    responseType?: "arraybuffer" | "blob" | "json" | "text";
    withCredentials?: boolean;
    timeout?: number;
}

/**
 * Extended http request options that the consumer can use
 */
export interface HttpRequestOptions extends HttpClientRequestOptions {
    /**
     * Read a specific property from the body if observe equals to 'body' and responseType equals to 'json'
     */
    read?: string;
    /**
     * Specifies when the cache for the request expires as an Observable
     */
    cache?: Observable<any>;
}

/**
 * Defines the type of uploadable content
 */
export type UploadData = Record<string, any> | ArrayBuffer | FormData;

export interface IIssueContext {
    url: string;
}

export interface IProgress {
    percentage?: number;
    loaded?: number;
    total?: number;
}

export type ProgressListener = (progress: IProgress) => void;

export type CacheExpireMode = boolean | "auth" | Date;

export interface IHttpService {
    readonly language: ILanguageService;
    readonly requestHeaders: Readonly<HttpRequestHeaders>;
    readonly requestParams: Readonly<HttpRequestQuery>;
    setHeader(name: string, value?: string | string[]): void;
    setParam(name: string, value?: any): void;
    cached(mode: CacheExpireMode): Observable<any>;
    url(url: string): string;
    makeListParams(page: number, itemsPerPage: number, orderBy?: string, orderDescending?: boolean, filter?: string): HttpRequestQuery;
}

// --- LocalHttp service ---

export interface SvgDefinition {
    source: SVGSVGElement;
    width: number;
    height: number;
}

export type SvgSourceModifier = (svg: SVGSVGElement, width: number, height: number) => string;

// --- Api service ---

export interface IBaseHttpClient extends HttpClient {
    readonly requestHeaders: Readonly<HttpRequestHeaders>;
    readonly requestParams: Readonly<HttpRequestQuery>;
    setHeader(name: string, value?: string | string[]): void;
    setParam(name: string, value?: any): void;
    makeHeaders(): HttpHeaders;
}

export interface IApiService extends IHttpService {
    client: IBaseHttpClient;
    get(url: string, options?: HttpRequestOptions): Promise<any>;
    delete(url: string, options?: HttpRequestOptions): Promise<any>;
    post(url: string, body?: any, options?: HttpRequestOptions): Promise<any>;
    put(url: string, body?: any, options?: HttpRequestOptions): Promise<any>;
    patch(url: string, body?: any, options?: HttpRequestOptions): Promise<any>;
    upload(url: string, body: any, listener?: ProgressListener, options?: HttpRequestOptions): Promise<any>;
    list(url: string, params: HttpRequestQuery, options?: HttpRequestOptions): Promise<IPaginationData>;
}

// --- OpenApi service ---
export interface DynamicSchemaRef {
    dynamicSchema?: string;
    dynamicSchemaUrl?: string;
    dynamicSchemaName?: string;
}

export interface OpenApiSchemaRef {
    $ref?: string;
}

export interface OpenApiSchemaProperty extends DynamicSchemaRef, OpenApiSchemaRef {
    id: string;
    type?: string;
    format?: string;
    column?: boolean;
    additionalProperties?: any;
    allOf?: ReadonlyArray<OpenApiSchemaRef>;
    oneOf?: ReadonlyArray<OpenApiSchemaRef>;
    items?: OpenApiSchemaProperty;
    enum?: string[];
    [key: string]: any;
}

export interface OpenApiSchema {
    properties: {
        [name: string]: OpenApiSchemaProperty;
    };
    required: string[];
}

export interface OpenApiSchemas {
    [name: string]: OpenApiSchema;
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

export type TableDataItems = ReadonlyArray<any>;

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

export type ResizeEventStrategy = "scroll" | "object" | "observer";

// --- Error handler service ---
export type ErrorHandlerCallback = (error: string) => any;

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
    iconType?: Type<IconProps>;
    iconMap?: IconMap;
    buttonType?: Type<ButtonProps>;
    initializeApp?: (injector: Injector) => AppInitializerFunc;
    baseUrl?: (injector: Injector) => string;
    resizeDelay?: number;
    resizeStrategy?: ResizeEventStrategy;
    socketPath?: string;
    staticSchemas?: OpenApiSchemas;
}

// --- Valued promise ---
export class ValuedPromise<T> extends Promise<T> {
    value: T;
}
