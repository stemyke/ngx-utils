import {ModuleWithProviders, NgModule, Provider} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UnorderedListComponent} from "./components";
import {ChunkPipe, EntriesPipe, FilterPipe, GroupByPipe, ReversePipe, TranslatePipe} from "./pipes";
import {
    AclService, StateService, StaticAuthService, StaticLanguageService, StorageService,
    UniversalService
} from "./services";
import {BackgroundDirective, IconDirective, PaginationDirective, PaginationItemDirective} from "./directives";
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
    PaginationItemDirective
];

// --- Pipes ---
export const pipes = [
    ChunkPipe,
    EntriesPipe,
    FilterPipe,
    GroupByPipe,
    ReversePipe,
    TranslatePipe
];

export interface NgxUtilsModuleConfig {
    providers?: Provider[];
}

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
        const config: NgxUtilsModuleConfig = {};
        config.providers = config.providers || [
            {
                provide: AUTH_SERVICE,
                useExisting: StaticAuthService
            },
            {
                provide: LANGUAGE_SERVICE,
                useExisting: StaticLanguageService
            }
        ];
        config.providers.push(
            AclService,
            StaticAuthService,
            StaticLanguageService,
            StateService,
            StorageService,
            UniversalService
        );
        return {
            ngModule: NgxUtilsModule,
            providers: config.providers
        }
    }
}
