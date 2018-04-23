import {ModuleWithProviders, NgModule} from "@angular/core";
import {EVENT_MANAGER_PLUGINS} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {UnorderedListComponent} from "./components";
import {
    ChunkPipe, EntriesPipe, ExtraItemPropertiesPipe, FilterPipe, FormatNumberPipe, GetOffsetPipe, GroupByPipe,
    MaxPipe, MinPipe, ReplacePipe, ReversePipe, RoundPipe, TranslatePipe, ValuesPipe
} from "./pipes";
import {
    AclService, EventsService, FormatterService, StateService, StaticAuthService, StaticLanguageService,
    StorageService, ConsoleToasterService, UniversalService
} from "./services";
import {
    AsyncMethodDirective,
    BackgroundDirective, IconDirective, PaginationDirective, PaginationItemDirective, ResourceIfDirective,
    StickyDirective
} from "./directives";
import {AuthGuard} from "./utils";
import {ScrollEventPlugin} from "./plugins";
import {AUTH_SERVICE, LANGUAGE_SERVICE, TOASTER_SERVICE} from "./common-types";

// --- Components ---
export const components = [
    UnorderedListComponent
];

// --- Directives ---
export const directives = [
    AsyncMethodDirective,
    BackgroundDirective,
    IconDirective,
    PaginationDirective,
    PaginationItemDirective,
    ResourceIfDirective,
    StickyDirective
];

// --- Pipes ---
export const pipes = [
    ChunkPipe,
    EntriesPipe,
    ExtraItemPropertiesPipe,
    FilterPipe,
    FormatNumberPipe,
    GetOffsetPipe,
    GroupByPipe,
    MaxPipe,
    MinPipe,
    ReplacePipe,
    ReversePipe,
    RoundPipe,
    TranslatePipe,
    ValuesPipe
];

@NgModule({
    declarations: [
        ...components,
        ...directives,
        ...pipes
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ...components,
        ...directives,
        ...pipes
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
            providers: [
                ...pipes,
                AuthGuard,
                AclService,
                StaticAuthService,
                EventsService,
                FormatterService,
                StaticLanguageService,
                StateService,
                StorageService,
                ConsoleToasterService,
                UniversalService,
                {
                    provide: EVENT_MANAGER_PLUGINS,
                    useClass: ScrollEventPlugin,
                    multi: true
                },
                {
                    provide: AUTH_SERVICE,
                    useExisting: StaticAuthService
                },
                {
                    provide: LANGUAGE_SERVICE,
                    useExisting: StaticLanguageService
                },
                {
                    provide: TOASTER_SERVICE,
                    useExisting: ConsoleToasterService
                }
            ]
        }
    }
}
