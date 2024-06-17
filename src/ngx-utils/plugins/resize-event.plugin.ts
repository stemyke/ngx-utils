import {ɵDomEventsPlugin as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import elementResizeDetectorMaker from "element-resize-detector";
import type {Erd} from "element-resize-detector";

import {RESIZE_DELAY, RESIZE_STRATEGY, ResizeEventStrategy} from "../common-types";
import {UniversalService} from "../services/universal.service";
import {TimerUtils} from "../utils/timer.utils";

function emptyRemove(): void {

}

function isWindow(el: any): boolean {
    return typeof window !== "undefined" && el === window;
}

@Injectable()
export class ResizeEventPlugin extends EventManagerPlugin {

    static readonly EVENT_NAME: string = "resize";

    readonly detector: Erd;

    constructor(@Inject(DOCUMENT) doc: any,
                @Inject(RESIZE_DELAY) protected resizeDelay: number,
                @Inject(RESIZE_STRATEGY) protected resizeStrategy: ResizeEventStrategy,
                readonly universal: UniversalService) {
        super(doc);
        this.detector = elementResizeDetectorMaker({
            strategy: resizeStrategy
        });
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
            const cb = el => {
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
