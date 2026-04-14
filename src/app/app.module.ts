import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule} from "@angular/platform-browser";
import {provideHttpClient} from "@angular/common/http";
import {Injectable, NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";

import {AppComponent} from "./app.component";
import {NgxUtilsModule} from "../public_api";

@Injectable()
export class HammerConfig extends HammerGestureConfig {
    constructor() {
        super();
        this.overrides = {
            pan: {
                threshold: 0,
                direction: 30
            }
        };
    }
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgxUtilsModule.forRoot(),
        HammerModule
    ],
    providers: [
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: HammerConfig
        },
        provideHttpClient()
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
