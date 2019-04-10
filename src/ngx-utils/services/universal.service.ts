import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import {DeviceDetectorService} from "ngx-device-detector";

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
        return this.dds.browser;
    }

    get browserVersion(): string {
        return this.dds.browser_version;
    }

    get isExplorer(): boolean {
        return this.dds.browser == "ie";
    }

    get isEdge(): boolean {
        return this.dds.browser == "ms-edge";
    }

    get isChrome(): boolean {
        return this.dds.browser == "chrome";
    }

    get isFirefox(): boolean {
        return this.dds.browser == "firefox";
    }

    get isSafari(): boolean {
        return this.dds.browser == "safari";
    }

    get isTablet(): boolean {
        return this.dds.isTablet();
    }

    get isMobile(): boolean {
        return this.dds.isMobile();
    }

    get isDesktop(): boolean {
        return this.dds.isDesktop();
    }

    constructor(@Inject(PLATFORM_ID) private platformId: string, private dds: DeviceDetectorService) {
    }
}
