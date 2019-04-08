import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import * as Bowser from "bowser";

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

    get browserName(): string {
        this.init();
        return this.name;
    }

    get isExplorer(): boolean {
        this.init();
        return this.explorer;
    }

    get isEdge(): boolean {
        this.init();
        return this.edge;
    }

    get isChrome(): boolean {
        this.init();
        return this.chrome;
    }

    get isFirefox(): boolean {
        this.init();
        return this.firefox;
    }

    get isSafari(): boolean {
        this.init();
        return this.safari;
    }

    get isTablet(): boolean {
        this.init();
        return this.tablet;
    }

    get isMobile(): boolean {
        this.init();
        return this.mobile;
    }

    private readonly browser: any;
    private initialized: boolean;
    private name: string;
    private explorer: boolean;
    private edge: boolean;
    private chrome: boolean;
    private firefox: boolean;
    private safari: boolean;
    private tablet: boolean;
    private mobile: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: string) {
        this.browser = isPlatformServer(this.platformId) ? null : Bowser.getParser(window.navigator.userAgent);
    }

    private init(): void {
        if (this.initialized) return;
        this.initialized = true;
        this.name = !this.browser ? "server" : this.browser.getBrowserName();
        this.explorer = this.satisfies({ie: ">=1"});
        this.edge = this.satisfies({edge: ">=1"});
        this.chrome = this.satisfies({chrome: ">=1"});
        this.firefox = this.satisfies({firefox: ">=1"});
        this.safari = this.satisfies({safari: ">=1"});
        this.tablet = this.satisfies({tablet: {android: ">=1", safari: ">=1"}});
        this.mobile = this.satisfies({mobile: {android: ">=1", safari: ">=1"}});
    }

    satisfies(query: any): boolean {
        return !this.browser ? false : this.browser.satisfies(query) || false;
    }
}
