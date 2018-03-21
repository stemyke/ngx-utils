import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {GroupByPipe} from "./pipes";

// --- Components ---
export const components = [
];

// --- Directives ---
export const directives = [
];

// --- Pipes ---
export const pipes = [
    GroupByPipe
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

    ]
})
export class NgxUtilsModule {
    static forChild(): ModuleWithProviders {
        return {
            ngModule: NgxUtilsModule,
            providers: pipes
        };
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxUtilsModule,
            providers: []
        }
    }
}
