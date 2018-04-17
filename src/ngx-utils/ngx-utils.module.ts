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
    StorageService, UniversalService
} from "./services";
import {
    BackgroundDirective, IconDirective, PaginationDirective, PaginationItemDirective, ResourceIfDirective,
    StickyDirective
} from "./directives";
import {AuthGuard} from "./utils";
import {ScrollEventPlugin} from "./plugins";
import {AUTH_SERVICE, LANGUAGE_SERVICE} from "./common-types";

// --- Components ---
export const components = [
    UnorderedListComponent
];

// --- Directives ---
export const directives = [
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
    providers: []
})
export class NgxUtilsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxUtilsModule,
            providers: [
                ...pipes,
                AclService,
                StaticAuthService,
                EventsService,
                FormatterService,
                StaticLanguageService,
                StateService,
                StorageService,
                UniversalService,
                AuthGuard,
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
                }
            ]
        }
    }
}
