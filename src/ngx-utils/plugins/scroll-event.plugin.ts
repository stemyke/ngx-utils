import {ɵangular_packages_platform_browser_platform_browser_d as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {UniversalService} from "../services";

export function emptyRemove(): void {

}

const globalElements: string[] = ["document", "window"];

@Injectable()
export class ScrollEventPlugin extends EventManagerPlugin {

    private static EVENT_NAME: string = "scroll";

    constructor(@Inject(DOCUMENT) doc: any, private universal: UniversalService) {
        super(doc);
    }

    supports(eventName) {
        return eventName === ScrollEventPlugin.EVENT_NAME;
    }

    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            const callback = (e: Event) => {
                zone.runGuarded(() => handler(e));
            };
            element.addEventListener(eventName, callback);
            return () => element.removeEventListener(eventName, callback);
        });
    }

    addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            if (globalElements.indexOf(element) < 0) {
                console.error("Global resize event other than window or document?", element);
                return emptyRemove;
            }
            const target: EventTarget = "window" == element ? window : document;
            const listener = <EventListenerOrEventListenerObject>handler;
            target.addEventListener(eventName, listener);
            return () => target.removeEventListener(eventName, listener);
        });
    }
}
