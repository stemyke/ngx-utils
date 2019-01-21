import {ɵangular_packages_platform_browser_platform_browser_g as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import elementResizeDetectorMaker from "element-resize-detector";
import {StringUtils} from "../utils/string.utils";
import {UniversalService} from "../services/universal.service";

function emptyRemove(): void {

}

@Injectable()
export class ResizeEventPlugin extends EventManagerPlugin {

    static strategy: string = "object";

    private static EVENT_NAME: string = "resize";
    private static detector: any = null;

    constructor(@Inject(DOCUMENT) doc: any, public universal: UniversalService) {
        super(doc);
    }

    supports(eventName) {
        return eventName === ResizeEventPlugin.EVENT_NAME;
    }

    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            ResizeEventPlugin.detector = ResizeEventPlugin.detector || elementResizeDetectorMaker({strategy: ResizeEventPlugin.strategy});
            ResizeEventPlugin.detector.listenTo(element, el => {
                zone.run(() => handler(el));
            });
            return () => {
                try {
                    ResizeEventPlugin.detector.uninstall(element);
                } catch (e) {
                }
            }
        });
    }

    addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            if (!StringUtils.has(element, "document", "window")) {
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
