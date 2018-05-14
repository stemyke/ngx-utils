import {ModuleWithProviders, NgModule} from "@angular/core";
import {EVENT_MANAGER_PLUGINS} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {AUTH_SERVICE, LANGUAGE_SERVICE, TOASTER_SERVICE} from "./common-types";
import {AuthGuard} from "./utils/auth.guard";
import {AclService} from "./services/acl.service";
import {StaticAuthService} from "./services/auth.service";
import {EventsService} from "./services/events.service";
import {FormatterService} from "./services/formatter.service";
import {StaticLanguageService} from "./services/language.service";
import {StateService} from "./services/state.service";
import {StorageService} from "./services/storage.service";
import {ConsoleToasterService} from "./services/toaster.service";
import {UniversalService} from "./services/universal.service";
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
import {FormatNumberPipe} from "./pipes/format-number.pipe";
import {GetOffsetPipe} from "./pipes/get-offset.pipe";
import {GroupByPipe} from "./pipes/group-by.pipe";
import {JoinPipe} from "./pipes/join.pipe";
import {KeysPipe} from "./pipes/keys.pipe";
import {MaxPipe} from "./pipes/max.pipe";
import {MinPipe} from "./pipes/min.pipe";
import {RemapPipe} from "./pipes/remap.pipe";
import {ReplacePipe} from "./pipes/replace.pipe";
import {ReversePipe} from "./pipes/reverse.pipe";
import {RoundPipe} from "./pipes/round.pipe";
import {TranslatePipe} from "./pipes/translate.pipe";
import {ValuesPipe} from "./pipes/values.pipe";
import {UnorderedListComponent} from "./components/unordered-list.component";

// --- Pipes ---
const pipes = [
    ChunkPipe,
    EntriesPipe,
    ExtraItemPropertiesPipe,
    FilterPipe,
    FormatNumberPipe,
    GetOffsetPipe,
    GroupByPipe,
    JoinPipe,
    KeysPipe,
    MaxPipe,
    MinPipe,
    RemapPipe,
    ReplacePipe,
    ReversePipe,
    RoundPipe,
    TranslatePipe,
    ValuesPipe
];

// --- Directives ---
const directives = [
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
const components = [
    UnorderedListComponent
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
