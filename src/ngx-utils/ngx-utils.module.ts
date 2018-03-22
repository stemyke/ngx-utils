import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {GroupByPipe, TranslationPipe} from "./pipes";
import {Provider} from "@angular/core/src/di";
import {LANGUAGE_SERVICE, StaticLanguageService} from "./services";

// --- Components ---
export const components = [
];

// --- Directives ---
export const directives = [
];

// --- Pipes ---
export const pipes = [
    GroupByPipe,
    TranslationPipe
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
