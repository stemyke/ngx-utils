import {ɵDomEventsPlugin as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {UniversalService} from "../services/universal.service";

export function emptyRemove(): void {

}

@Injectable()
export class ScrollEventPlugin extends EventManagerPlugin {

    private static EVENT_NAME: string = "scroll";

    constructor(@Inject(DOCUMENT) doc: any, private universal: UniversalService) {
        super(doc);
    }

    supports(eventName: string) {
        return eventName === ScrollEventPlugin.EVENT_NAME;
    }

    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            const callback = (e: Event) => {
                zone.run(() => handler(e));
            };
            element.addEventListener(eventName, callback);
            return () => element.removeEventListener(eventName, callback);
        });
    }
}
