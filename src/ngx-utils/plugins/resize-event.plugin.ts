import {ɵDomEventsPlugin as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";

import {ResizeEventStrategy} from "../common-types";
import {TimerUtils} from "../utils/timer.utils";
import {UniversalService} from "../services/universal.service";
import {ResizeDetector} from "./resize-detector";
import {RESIZE_DELAY, RESIZE_STRATEGY} from "../tokens";

function emptyRemove(): void {

}

function isWindow(el: any): boolean {
    return typeof window !== "undefined" && el === window;
}

@Injectable()
export class ResizeEventPlugin extends EventManagerPlugin {

    static readonly EVENT_NAME: string = "resize";

    readonly detector: ResizeDetector;

    constructor(@Inject(DOCUMENT) doc: any,
                @Inject(RESIZE_DELAY) protected resizeDelay: number,
                @Inject(RESIZE_STRATEGY) protected resizeStrategy: ResizeEventStrategy,
                readonly universal: UniversalService) {
        super(doc);
        this.detector = new ResizeDetector(resizeStrategy);
    }

    supports(eventName: string) {
        return eventName === ResizeEventPlugin.EVENT_NAME;
    }

    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer)
                return emptyRemove;
            const timer = TimerUtils.createTimeout();
            const cb = (el: any) => {
                timer.set(() => {
                    zone.run(() => handler(el));
                }, this.resizeDelay);
            };
            if (isWindow(element)) {
                element.addEventListener(eventName, cb);
            }
            else {
                this.detector.listenTo(element, cb);
            }
            return () => {
                try {
                    if (isWindow(element)) {
                        element.removeEventListener(eventName, cb);
                    }
                    else {
                        this.detector.uninstall(element);
                    }
                }
                catch (e) {
                } finally {
                    timer.clear();
                }
            };
        });
    }
}
