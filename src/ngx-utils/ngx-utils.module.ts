import {InjectionToken, ModuleWithProviders, NgModule} from "@angular/core";
import {
    EVENT_MANAGER_PLUGINS,
    ɵangular_packages_platform_browser_platform_browser_g as EventManagerPlugin
} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {
    AUTH_SERVICE, IAuthService, ICON_SERVICE, IIconService, ILanguageService, IPromiseService, IToasterService, LANGUAGE_SERVICE,
    PROMISE_SERVICE, TOASTER_SERVICE
} from "./common-types";
import {AuthGuard} from "./utils/auth.guard";
import {AclService} from "./services/acl.service";
import {StaticAuthService} from "./services/auth.service";
import {EventsService} from "./services/events.service";
import {FormatterService} from "./services/formatter.service";
import {IconService} from "./services/icon.service";
import {StaticLanguageService} from "./services/language.service";
import {StateService} from "./services/state.service";
import {StorageService} from "./services/storage.service";
import {ConsoleToasterService} from "./services/toaster.service";
import {UniversalService} from "./services/universal.service";
import {ResizeEventPlugin} from "./plugins/resize-event.plugin";
import {ScrollEventPlugin} from "./plugins/scroll-event.plugin";
import {AsyncMethodDirective} from "./directives/async-method.directive";
import {BackgroundDirective} from "./directives/background.directive";
import {IconDirective} from "./directives/icon.directive";
import {PaginationDirective} from "./directives/pagination.directive";
import {PaginationItemDirective} from "./directives/pagination-item.directive";
import {ResourceIfDirective} from "./directives/resource-if.directive";
import {StickyDirective} from "./directives/sticky.directive";
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
import {GroupByPipe} from "./pipes/group-by.pipe";
import {IsTypePipe} from "./pipes/is-type.pipe";
import {JoinPipe} from "./pipes/join.pipe";
import {KeysPipe} from "./pipes/keys.pipe";
import {MapPipe} from "./pipes/map.pipe";
import {MaxPipe} from "./pipes/max.pipe";
import {MinPipe} from "./pipes/min.pipe";
import {ReducePipe} from "./pipes/reduce.pipe";
import {RemapPipe} from "./pipes/remap.pipe";
import {ReplacePipe} from "./pipes/replace.pipe";
import {ReversePipe} from "./pipes/reverse.pipe";
import {RoundPipe} from "./pipes/round.pipe";
import {TranslatePipe} from "./pipes/translate.pipe";
import {ValuesPipe} from "./pipes/values.pipe";
import {UnorderedListComponent} from "./components/unordered-list/unordered-list.component";
import {SafeHtmlPipe} from "./pipes/safe-html.pipe";
import {PromiseService} from "./services/promise.service";

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
    GroupByPipe,
    IsTypePipe,
    JoinPipe,
    KeysPipe,
    MapPipe,
    MaxPipe,
    MinPipe,
    ReducePipe,
    RemapPipe,
    ReplacePipe,
    ReversePipe,
    RoundPipe,
    SafeHtmlPipe,
    TranslatePipe,
    ValuesPipe
];

// --- Directives ---
export const directives = [
    AsyncMethodDirective,
    BackgroundDirective,
    IconDirective,
    PaginationDirective,
    PaginationItemDirective,
    ResourceIfDirective,
    StickyDirective,
    UnorderedListItemDirective,
    UnorderedListTemplateDirective
];

// --- Components ---
export const components = [
    UnorderedListComponent
];

// --- Providers ---
export const eventManagerPluginsToken: InjectionToken<EventManagerPlugin> = EVENT_MANAGER_PLUGINS;
export const authServiceToken: InjectionToken<IAuthService> = AUTH_SERVICE;
export const iconServiceToken: InjectionToken<IIconService> = ICON_SERVICE;
export const languageServiceToken: InjectionToken<ILanguageService> = LANGUAGE_SERVICE;
export const toasterServiceToken: InjectionToken<IToasterService> = TOASTER_SERVICE;
export const promiseServiceToken: InjectionToken<IPromiseService> = PROMISE_SERVICE;

export const providers = [
    ...pipes,
    AuthGuard,
    AclService,
    StaticAuthService,
    EventsService,
    FormatterService,
    IconService,
    StaticLanguageService,
    StateService,
    StorageService,
    ConsoleToasterService,
    UniversalService,
    PromiseService,
    {
        provide: eventManagerPluginsToken,
        useClass: ResizeEventPlugin,
        multi: true
    },
    {
        provide: eventManagerPluginsToken,
        useClass: ScrollEventPlugin,
        multi: true
    },
    {
        provide: authServiceToken,
        useExisting: StaticAuthService
    },
    {
        provide: iconServiceToken,
        useExisting: IconService
    },
    {
        provide: languageServiceToken,
        useExisting: StaticLanguageService
    },
    {
        provide: toasterServiceToken,
        useExisting: ConsoleToasterService
    },
    {
        provide: promiseServiceToken,
        useExisting: PromiseService
    }
];

@NgModule({
    declarations: [
        ...pipes,
        ...directives,
        ...components
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ...pipes,
        ...directives,
        ...components
    ],
    providers: [
        ...pipes,
        AuthGuard
    ]
})
export class NgxUtilsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxUtilsModule,
            providers: providers
        };
    }
}
