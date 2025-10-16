import "zone.js";

export {
    MaybePromise,
    MaybeArray,
    KeysOfType,
    ObjOfType,
    StringKeys,
    CapitalizeFirst,
    CamelJoin,
    PrefixedPick
} from "./ngx-utils/helper-types";

export {
    DurationUnit,
    TypedFactoryProvider,
    TypedValueProvider,
    TypedExistingProvider,
    TypedClassProvider,
    TypedTokenProvider,
    TypedProvider,
    CachedFactory,
    ResolveFactory,
    IResolveFactory,
    CanvasColor,
    IIconService,
    ITranslation,
    ITranslations,
    ILanguageSetting,
    ILanguageSettings,
    ILanguageService,
    IUserData,
    IAuthService,
    RouteValidator,
    IRouteData,
    IRoute,
    IAclComponent,
    IDialogButtonConfig,
    IDialogConfig,
    IConfirmMessageConfig,
    IConfirmDialogConfig,
    IDialogService,
    IPromiseService,
    IRouteStateInfo,
    NavigationUrlParam,
    StorageMode,
    ToastType,
    IToasterService,
    IAsyncMessage,
    AsyncMethod,
    IconMap,
    IconProps,
    ButtonType,
    ButtonSize,
    ButtonProps,
    TabValue,
    TabOption,
    ChipValue,
    ChipStatus,
    ChipOption,
    DropdownAttachTo,
    UnorderedListTemplate,
    UnorderedListTemplates,
    UnorderedListStyle,
    UploadType,
    IFileUploadResult,
    IFileUploadProcess,
    IAjaxRequestDetails,
    AjaxRequestCallback,
    ScriptType,
    ILoadableElement,
    ILoaderPromises,
    ISearchObservable,
    FactoryDependencies,
    ObjectType,
    ITimer,
    IExtraProperties,
    IGroupMap,
    TranslationQuery,
    IPageInfo,
    IPaginationData,
    PaginationDataLoader,
    PaginationItemContext,
    IPoint,
    ShapeIntersection,
    ShapeDistance,
    IShape,
    CanvasResizeMode,
    CanvasItemDirection,
    CanvasPaintFunc,
    RangeCoords,
    RectCoords,
    Frame,
    InteractiveCanvasParams,
    InteractiveCanvasItem,
    InteractiveCanvasItems,
    InteractiveCanvas,
    InteractiveCanvasRenderer,
    InteractivePanEvent,
    InteractiveCanvasPointer,
    HttpRequestHeaders,
    HttpRequestQuery,
    HttpClientRequestOptions,
    HttpRequestOptions,
    UploadData,
    IIssueContext,
    IProgress,
    ProgressListener,
    CacheExpireMode,
    IHttpService,
    SvgSourceModifier,
    IApiService,
    DynamicSchemaRef,
    OpenApiSchemaProperty,
    OpenApiSchema,
    OpenApiSchemas,
    TableFilterType,
    ITableOrders,
    ITableColumn,
    ITableColumns,
    TableColumns,
    ITableTemplate,
    ITableTemplates,
    ITableDataQuery,
    TableDataItems,
    TableDataLoader,
    DragDropEvent,
    DragEventHandler,
    ITableDragEvent,
    DynamicTableDragHandler,
    ResourceIfContext,
    CssSelector,
    CssSelectorList,
    DynamicComponentLocation,
    DynamicModuleInfo,
    DynamicEntryComponents,
    IConfiguration,
    IConfigService,
    ResizeEventStrategy,
    ErrorHandlerCallback,
    GlobalComponentModifier,
    AppInitializerFunc,
    IModuleConfig,
    ValuedPromise
} from "./ngx-utils/common-types";

export {
    ICON_TYPE,
    ICON_MAP,
    BUTTON_TYPE,
    ERROR_HANDLER,
    STATIC_SCHEMAS,
    RESIZE_STRATEGY,
    RESIZE_DELAY,
    ROOT_ELEMENT,
    SCRIPT_PARAMS,
    BASE_CONFIG,
    CONFIG_SERVICE,
    APP_BASE_URL,
    API_SERVICE,
    EXPRESS_REQUEST,
    PROMISE_SERVICE,
    DIALOG_SERVICE,
    TOASTER_SERVICE,
    AUTH_SERVICE,
    LANGUAGE_SERVICE,
    ICON_SERVICE,
    OPTIONS_TOKEN
} from "./ngx-utils/tokens";

export {AjaxRequestHandler} from "./ngx-utils/utils/ajax-request-handler";
export {ArrayUtils} from "./ngx-utils/utils/array.utils";
export {AuthGuard} from "./ngx-utils/utils/auth.guard";
export {createTypedProvider, cachedFactory} from "./ngx-utils/utils/cached-factory";
export {CanvasUtils} from "./ngx-utils/utils/canvas";
export {DateUtils} from "./ngx-utils/utils/date.utils";
export {FileUtils} from "./ngx-utils/utils/file.utils";
export {ForbiddenZone} from "./ngx-utils/utils/forbidden-zone";
export {GenericValue} from "./ngx-utils/utils/generic-value";
export {FileSystemEntryOpenResult, FileSystemEntryOpenCb, FileSystemEntry} from "./ngx-utils/utils/file-system";
export {
    dotProduct,
    tripleProduct,
    isPoint,
    ensurePoint,
    perpendicular,
    negatePt,
    normalizePt,
    addPts,
    distanceSq,
    distance,
    lerpPts,
    lengthOfPt,
    multiplyPts,
    dividePts,
    subPts,
    rotateDeg,
    rotateRad,
    toDegrees,
    toRadians,
    gjkDistance,
    gjkIntersection,
    Point, Rect, Oval, Circle
} from "./ngx-utils/utils/geometry";
export {Initializer} from "./ngx-utils/utils/initializer";
export {JSONfn} from "./ngx-utils/utils/jsonfn";
export {ReflectUtils} from "./ngx-utils/utils/reflect.utils";
export {LoaderUtils} from "./ngx-utils/utils/loader.utils";
export {EPSILON, normalizeRange, clamp, overflow, MathUtils} from "./ngx-utils/utils/math.utils";
export {
    isBrowser,
    getRoot,
    hashCode,
    switchClass,
    getCssVariables,
    checkTransitions,
    getComponentDef,
    parseSelector,
    selectorMatchesList,
    provideEntryComponents,
    provideOptions,
    provideWithOptions,
    injectOptions
} from "./ngx-utils/utils/misc";
export {ObjectUtils} from "./ngx-utils/utils/object.utils";
export {ObservableUtils, ISubscriberInfo} from "./ngx-utils/utils/observable.utils";
export {CancelablePromise, cancelablePromise, impatientPromise} from "./ngx-utils/utils/promise.utils";
export {svgToDataUri, StringUtils} from "./ngx-utils/utils/string.utils";
export {SetUtils} from "./ngx-utils/utils/set.utils";
export {computedPrevious, cssStyles, cssVariables} from "./ngx-utils/utils/signal-utils";
export {SocketFactory, SocketData, SocketDataValue, SocketDataObj, SocketClient} from "./ngx-utils/utils/socket-client";
export {TimerUtils} from "./ngx-utils/utils/timer.utils";
export {UniqueUtils} from "./ngx-utils/utils/unique.utils";

export {UniversalService} from "./ngx-utils/services/universal.service";
export {AclService} from "./ngx-utils/services/acl.service";
export {ApiService} from "./ngx-utils/services/api.service";
export {StaticAuthService} from "./ngx-utils/services/auth.service";
export {BaseHttpClient} from "./ngx-utils/services/base-http.client";
export {BaseHttpService} from "./ngx-utils/services/base-http.service";
export {ConfigService} from "./ngx-utils/services/config.service";
export {BaseDialogService} from "./ngx-utils/services/base-dialog.service";
export {ErrorHandlerService} from "./ngx-utils/services/error-handler.service";
export {EventsService} from "./ngx-utils/services/events.service";
export {FormatterService} from "./ngx-utils/services/formatter.service";
export {GlobalTemplateService} from "./ngx-utils/services/global-template.service";
export {IconService} from "./ngx-utils/services/icon.service";
export {LanguageService} from "./ngx-utils/services/language.service";
export {LocalHttpService} from "./ngx-utils/services/local-http.service";
export {OpenApiService} from "./ngx-utils/services/open-api.service";
export {IStateInfo, StateService} from "./ngx-utils/services/state.service";
export {StaticLanguageService} from "./ngx-utils/services/static-language.service";
export {StorageService} from "./ngx-utils/services/storage.service";
export {BaseToasterService} from "./ngx-utils/services/base-toaster.service";
export {CacheService} from "./ngx-utils/services/cache.service";
export {ComponentLoaderService} from "./ngx-utils/services/component-loader.service";
export {IUrlDictionary, TranslatedUrlSerializer} from "./ngx-utils/services/translated-url.serializer";
export {PromiseService} from "./ngx-utils/services/promise.service";
export {SocketService} from "./ngx-utils/services/socket.service";

export {DragEventListener} from "./ngx-utils/plugins/drag-drop-handler";
export {DragDropEventPlugin} from "./ngx-utils/plugins/drag-drop-event.plugin";
export {ResizeEventPlugin} from "./ngx-utils/plugins/resize-event.plugin";
export {ScrollEventPlugin} from "./ngx-utils/plugins/scroll-event.plugin";

export {ChunkPipe} from "./ngx-utils/pipes/chunk.pipe";
export {EntriesPipe} from "./ngx-utils/pipes/entries.pipe";
export {ExtraItemPropertiesPipe} from "./ngx-utils/pipes/extra-item-properties.pipe";
export {FilterPipe} from "./ngx-utils/pipes/filter.pipe";
export {FindPipe} from "./ngx-utils/pipes/find.pipe";
export {FormatNumberPipe} from "./ngx-utils/pipes/format-number.pipe";
export {GetOffsetPipe} from "./ngx-utils/pipes/get-offset.pipe";
export {GetTypePipe} from "./ngx-utils/pipes/get-type.pipe";
export {GetValuePipe} from "./ngx-utils/pipes/get-value.pipe";
export {GlobalTemplatePipe} from "./ngx-utils/pipes/global-template.pipe";
export {GroupByPipe} from "./ngx-utils/pipes/group-by.pipe";
export {IncludesPipe} from "./ngx-utils/pipes/includes.pipe";
export {IsTypePipe} from "./ngx-utils/pipes/is-type.pipe";
export {JoinPipe} from "./ngx-utils/pipes/join.pipe";
export {KeysPipe} from "./ngx-utils/pipes/keys.pipe";
export {MapPipe} from "./ngx-utils/pipes/map.pipe";
export {MaxPipe} from "./ngx-utils/pipes/max.pipe";
export {MinPipe} from "./ngx-utils/pipes/min.pipe";
export {PopPipe} from "./ngx-utils/pipes/pop.pipe";
export {ReducePipe} from "./ngx-utils/pipes/reduce.pipe";
export {RemapPipe} from "./ngx-utils/pipes/remap.pipe";
export {ReplacePipe} from "./ngx-utils/pipes/replace.pipe";
export {ReversePipe} from "./ngx-utils/pipes/reverse.pipe";
export {RoundPipe} from "./ngx-utils/pipes/round.pipe";
export {SafeHtmlPipe} from "./ngx-utils/pipes/safe-html.pipe";
export {ShiftPipe} from "./ngx-utils/pipes/shift.pipe";
export {SplitPipe} from "./ngx-utils/pipes/split.pipe";
export {TranslatePipe} from "./ngx-utils/pipes/translate.pipe";
export {ValuesPipe} from "./ngx-utils/pipes/values.pipe";

export {AsyncMethodBase} from "./ngx-utils/directives/async-method.base";
export {AsyncMethodDirective} from "./ngx-utils/directives/async-method.directive";
export {AsyncMethodTargetDirective} from "./ngx-utils/directives/async-method-target.directive";
export {BackgroundDirective} from "./ngx-utils/directives/background.directive";
export {ComponentLoaderDirective} from "./ngx-utils/directives/component-loader.directive";
export {DynamicTableTemplateDirective} from "./ngx-utils/directives/dynamic-table-template.directive";
export {GlobalTemplateDirective} from "./ngx-utils/directives/global-template.directive";
export {IconDirective} from "./ngx-utils/directives/icon.directive";
export {NgxTemplateOutletDirective} from "./ngx-utils/directives/ngx-template-outlet.directive";
export {PaginationDirective} from "./ngx-utils/directives/pagination.directive";
export {PaginationItemDirective} from "./ngx-utils/directives/pagination-item.directive";
export {ResourceIfDirective} from "./ngx-utils/directives/resource-if.directive";
export {StickyDirective} from "./ngx-utils/directives/sticky.directive";
export {StickyClassDirective} from "./ngx-utils/directives/sticky-class.directive";
export {DropdownDirective} from "./ngx-utils/directives/dropdown.directive";
export {DropdownContentDirective} from "./ngx-utils/directives/dropdown-content.directive";
export {DropdownToggleDirective} from "./ngx-utils/directives/dropdown-toggle.directive";
export {TabsItemDirective} from "./ngx-utils/directives/tabs-item.directive";
export {TabsTemplateDirective} from "./ngx-utils/directives/tabs-template.directive";
export {UnorderedListItemDirective} from "./ngx-utils/directives/unordered-list-item.directive";
export {UnorderedListTemplateDirective} from "./ngx-utils/directives/unordered-list-template.directive";

export {BtnComponent} from "./ngx-utils/components/btn/btn.component";
export {BtnDefaultComponent} from "./ngx-utils/components/btn-default/btn-default.component";
export {ChipsComponent} from "./ngx-utils/components/chips/chips.component";
export {CloseBtnComponent} from "./ngx-utils/components/close-btn/close-btn.component";
export {DropListComponent} from "./ngx-utils/components/drop-list/drop-list.component";
export {DropdownBoxComponent} from "./ngx-utils/components/dropdown-box/dropdown-box.component";
export {DynamicTableComponent} from "./ngx-utils/components/dynamic-table/dynamic-table.component";
export {FakeModuleComponent} from "./ngx-utils/components/fake-module/fake-module.component";
export {IconComponent} from "./ngx-utils/components/icon/icon.component";
export {IconDefaultComponent} from "./ngx-utils/components/icon-default/icon-default.component";
export {InteractiveCanvasComponent} from "./ngx-utils/components/interactive-canvas/interactive-canvas.component";
export {InteractiveItemComponent} from "./ngx-utils/components/interactive-canvas/interactive-item.component";
export {InteractiveCircleComponent} from "./ngx-utils/components/interactive-canvas/interactive-circle.component";
export {InteractiveRectComponent} from "./ngx-utils/components/interactive-canvas/interactive-rect.component";
export {PaginationMenuComponent} from "./ngx-utils/components/pagination-menu/pagination-menu.component";
export {TabsComponent} from "./ngx-utils/components/tabs/tabs.component";
export {UnorderedListComponent} from "./ngx-utils/components/unordered-list/unordered-list.component";
export {UploadComponent} from "./ngx-utils/components/upload/upload.component";

export {NgxUtilsModule} from "./ngx-utils/ngx-utils.module";
