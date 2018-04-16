import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import * as bowser from "bowser";

/**
 * Use this service to determine which is the current environment
 */
@Injectable()
export class UniversalService {

    get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    get isServer(): boolean {
        return isPlatformServer(this.platformId);
    }

    get isExplorer(): boolean {
        return bowser.msie;
    }

    get isEdge(): boolean {
        return bowser.msedge;
    }

    get isChrome(): boolean {
        return bowser.chrome;
    }

    get isFirefox(): boolean {
        return bowser.firefox;
    }

    get isTablet(): boolean {
        return bowser.tablet;
    }

    get isMobile(): boolean {
        return bowser.mobile;
    }

    constructor(@Inject(PLATFORM_ID) private platformId: string) {
    }
}
