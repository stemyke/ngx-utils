import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import {DeviceDetectorService, DeviceInfo} from "ngx-device-detector";

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

    get deviceInfo(): DeviceInfo {
        return this.isServer
            ? {
                userAgent: "angular-universal",
                os: "unknown",
                browser: "node",
                device: "node",
                os_version: "unknown",
                browser_version: "unknown",
                deviceType: "unknown",
                orientation: "landscape"
            } as any
            : this.dds.getDeviceInfo();
    }

    get browserName(): string {
        return (this.dds.browser || "").toLowerCase();
    }

    get browserVersion(): string {
        return this.dds.browser_version;
    }

    get isExplorer(): boolean {
        return this.checkBrowser("ie");
    }

    get isEdge(): boolean {
        return this.checkBrowser("edge");
    }

    get isChrome(): boolean {
        return this.checkBrowser("chrome");
    }

    get isFirefox(): boolean {
        return this.checkBrowser("firefox");
    }

    get isSafari(): boolean {
        return this.checkBrowser("safari");
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

    get isCrawler(): boolean {
        return this.crawler;
    }

    private readonly crawler: boolean;

    constructor(@Inject(PLATFORM_ID) readonly platformId: string, readonly dds: DeviceDetectorService) {
        const info = this.dds.getDeviceInfo();
        this.crawler = /(bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|lighthouse|angular-universal|PTST|PostmanRuntime)/gi.test(info.userAgent);
    }

    protected checkBrowser(name: string): boolean {
        return this.browserName.includes(name) || false;
    }
}
