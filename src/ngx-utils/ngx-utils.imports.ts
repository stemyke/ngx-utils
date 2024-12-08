import {ErrorHandler} from "@angular/core";
import {EVENT_MANAGER_PLUGINS} from "@angular/platform-browser";
import {UrlSerializer} from "@angular/router";
import {DeviceDetectorService} from "ngx-device-detector";

import {IConfigService} from "./common-types";

import {AuthGuard} from "./utils/auth.guard";
import {AclService} from "./services/acl.service";
import {ApiService} from "./services/api.service";
import {StaticAuthService} from "./services/auth.service";
import {BaseHttpClient} from "./services/base-http.client";
import {BaseHttpService} from "./services/base-http.service";
import {ConfigService} from "./services/config.service";
import {BaseDialogService} from "./services/base-dialog.service";
import {ErrorHandlerService} from "./services/error-handler.service";
import {EventsService} from "./services/events.service";
import {FormatterService} from "./services/formatter.service";
import {GlobalTemplateService} from "./services/global-template.service";
import {IconService} from "./services/icon.service";
import {LanguageService} from "./services/language.service";
import {LocalHttpService} from "./services/local-http.service";
import {PromiseService} from "./services/promise.service";
import {OpenApiService} from "./services/open-api.service";
import {StateService} from "./services/state.service";
import {StaticLanguageService} from "./services/static-language.service";
import {StorageService} from "./services/storage.service";
import {BaseToasterService} from "./services/base-toaster.service";
import {TranslatedUrlSerializer} from "./services/translated-url.serializer";
import {UniversalService} from "./services/universal.service";
import {WasmService} from "./services/wasm.service";
import {ResizeEventPlugin} from "./plugins/resize-event.plugin";
import {ScrollEventPlugin} from "./plugins/scroll-event.plugin";
import {AsyncMethodBase} from "./directives/async-method.base";
import {AsyncMethodDirective} from "./directives/async-method.directive";
import {BackgroundDirective} from "./directives/background.directive";
import {DynamicTableTemplateDirective} from "./directives/dynamic-table-template.directive";
import {GlobalTemplateDirective} from "./directives/global-template.directive";
import {IconDirective} from "./directives/icon.directive";
import {NgxTemplateOutletDirective} from "./directives/ngx-template-outlet.directive";
import {PaginationDirective} from "./directives/pagination.directive";
import {PaginationItemDirective} from "./directives/pagination-item.directive";
import {ResourceIfDirective} from "./directives/resource-if.directive";
import {StickyDirective} from "./directives/sticky.directive";
import {StickyClassDirective} from "./directives/sticky-class.directive";
import {UnorderedListItemDirective} from "./directives/unordered-list-item.directive";
import {UnorderedListTemplateDirective} from "./directives/unordered-list-template.directive";

import {ChunkPipe} from "./pipes/chunk.pipe";
import {EntriesPipe} from "./pipes/entries.pipe";
import {ExtraItemPropertiesPipe} from "./pipes/extra-item-properties.pipe";
import {FilterPipe} from "./pipes/filter.pipe";
import {FindPipe} from "./pipes/find.pipe";
import {FormatNumberPipe} from "./pipes/format-number.pipe";
import {GetOffsetPipe} from "./pipes/get-offset.pipe";
import {GetTypePipe} from "./pipes/get-type.pipe";
import {GetValuePipe} from "./pipes/get-value.pipe";
import {GlobalTemplatePipe} from "./pipes/global-template.pipe";
import {GroupByPipe} from "./pipes/group-by.pipe";
import {IsTypePipe} from "./pipes/is-type.pipe";
import {JoinPipe} from "./pipes/join.pipe";
import {KeysPipe} from "./pipes/keys.pipe";
import {MapPipe} from "./pipes/map.pipe";
import {MaxPipe} from "./pipes/max.pipe";
import {MinPipe} from "./pipes/min.pipe";
import {PopPipe} from "./pipes/pop.pipe";
import {ReducePipe} from "./pipes/reduce.pipe";
import {RemapPipe} from "./pipes/remap.pipe";
import {ReplacePipe} from "./pipes/replace.pipe";
import {ReversePipe} from "./pipes/reverse.pipe";
import {RoundPipe} from "./pipes/round.pipe";
import {SafeHtmlPipe} from "./pipes/safe-html.pipe";
import {ShiftPipe} from "./pipes/shift.pipe";
import {SplitPipe} from "./pipes/split.pipe";
import {TranslatePipe} from "./pipes/translate.pipe";
import {ValuesPipe} from "./pipes/values.pipe";

import {DynamicTableComponent} from "./components/dynamic-table/dynamic-table.component";
import {PaginationMenuComponent} from "./components/pagination-menu/pagination-menu.component";
import {UnorderedListComponent} from "./components/unordered-list/unordered-list.component";

// --- Pipes ---
export const pipes = [
    ChunkPipe,
    EntriesPipe,
    ExtraItemPropertiesPipe,
    FilterPipe,
    FindPipe,
    FormatNumberPipe,
    GetOffsetPipe,
    GetTypePipe,
    GetValuePipe,
    GlobalTemplatePipe,
    GroupByPipe,
    IsTypePipe,
    JoinPipe,
    KeysPipe,
    MapPipe,
    MaxPipe,
    MinPipe,
    PopPipe,
    ReducePipe,
    RemapPipe,
    ReplacePipe,
    ReversePipe,
    RoundPipe,
    SafeHtmlPipe,
    ShiftPipe,
    SplitPipe,
    TranslatePipe,
    ValuesPipe
];

// --- Directives ---
export const directives = [
    AsyncMethodBase,
    AsyncMethodDirective,
    BackgroundDirective,
    DynamicTableTemplateDirective,
    GlobalTemplateDirective,
    IconDirective,
    NgxTemplateOutletDirective,
    PaginationDirective,
    PaginationItemDirective,
    ResourceIfDirective,
    StickyDirective,
    StickyClassDirective,
    UnorderedListItemDirective,
    UnorderedListTemplateDirective
];

// --- Components ---
export const components = [
    DynamicTableComponent,
    PaginationMenuComponent,
    UnorderedListComponent
];

export const providers = [
    ...pipes,
    BaseHttpClient,
    BaseHttpService,
    AuthGuard,
    AclService,
    ApiService,
    StaticAuthService,
    ConfigService,
    BaseDialogService,
    ErrorHandlerService,
    EventsService,
    FormatterService,
    GlobalTemplateService,
    IconService,
    LanguageService,
    LocalHttpService,
    OpenApiService,
    PromiseService,
    StateService,
    StaticLanguageService,
    StorageService,
    BaseToasterService,
    TranslatedUrlSerializer,
    UniversalService,
    WasmService,
    DeviceDetectorService,
    GlobalTemplateService,
    {
        provide: EVENT_MANAGER_PLUGINS,
        useClass: ResizeEventPlugin,
        multi: true
    },
    {
        provide: EVENT_MANAGER_PLUGINS,
        useClass: ScrollEventPlugin,
        multi: true
    },
    {
        provide: UrlSerializer,
        useExisting: TranslatedUrlSerializer
    },
    {
        provide: ErrorHandler,
        useExisting: ErrorHandlerService
    }

];

export function loadConfig(config: IConfigService): any {
    return config.load;
}
