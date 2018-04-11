import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UnorderedListComponent} from "./components";
import {ChunkPipe, EntriesPipe, FilterPipe, GroupByPipe, ReversePipe, TranslatePipe} from "./pipes";
import {Provider} from "@angular/core/src/di";
import {LANGUAGE_SERVICE, StaticLanguageService} from "./services";
import {IconDirective, JsonVarDirective} from "./directives";

// --- Components ---
export const components = [
    UnorderedListComponent
];

// --- Directives ---
export const directives = [
    IconDirective,
    JsonVarDirective
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
    providers: [
        StaticLanguageService,
        {
            provide: LANGUAGE_SERVICE,
            useExisting: StaticLanguageService
        }
    ]
})
export class NgxUtilsModule {
    static forRoot(config?: NgxUtilsModuleConfig): ModuleWithProviders {
        config = config || {};
        return {
            ngModule: NgxUtilsModule,
            providers: config.providers ||[]
        }
    }
}
