import {ɵDomEventsPlugin as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import elementResizeDetectorMaker from "element-resize-detector";
import {UniversalService} from "../services/universal.service";

function emptyRemove(): void {

}

function isWindow(el: any): boolean {
    return typeof window !== "undefined" && el === window;
}

const detector = elementResizeDetectorMaker({
    strategy: "scroll" // For ultra performance.
});

@Injectable()
export class ResizeEventPlugin extends EventManagerPlugin {

    private static EVENT_NAME: string = "resize";

    constructor(@Inject(DOCUMENT) doc: any, public universal: UniversalService) {
        super(doc);
    }

    supports(eventName) {
        return eventName === ResizeEventPlugin.EVENT_NAME;
    }

    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer)
                return emptyRemove;
            const cb = el => {
                zone.run(() => handler(el));
                console.log("HI", el)
            };
            if (isWindow(element)) {
                element.addEventListener(eventName, cb);
            }
            else {
                detector.listenTo(element, cb);
            }
            return () => {
                try {
                    if (isWindow(element)) {
                        element.removeEventListener(eventName, cb);
                    }
                    else {
                        detector.uninstall(element);
                    }
                }
                catch (e) {
                }
            };
        });
    }
}
