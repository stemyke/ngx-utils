import {ɵd} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {UniversalService} from "../services";

function emptyRemove(): void {

}

declare const elementResizeDetectorMaker: any;

@Injectable()
export class ScrollEventPlugin extends ɵd {

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
            if (!element.has("document", "window")) {
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
