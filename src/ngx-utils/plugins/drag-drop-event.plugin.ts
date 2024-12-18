import {ɵDomEventsPlugin as EventManagerPlugin} from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {UniversalService} from "../services/universal.service";
import {DragDropHandler, DragHandlerEvents} from "./drag-drop-handler";

export function emptyRemove(): void {

}

@Injectable()
export class DragDropEventPlugin extends EventManagerPlugin {

    private static EVENT_NAMES: DragHandlerEvents[] = ["dragstart", "dragenter", "dragleave", "drop"];

    constructor(@Inject(DOCUMENT) doc: any, private universal: UniversalService) {
        super(doc);
    }

    supports(eventName: DragHandlerEvents) {
        return DragDropEventPlugin.EVENT_NAMES.includes(eventName);
    }

    addEventListener(element: HTMLElement, eventName: DragHandlerEvents, handler: Function): Function {
        const zone = this.manager.getZone();
        return zone.runOutsideAngular(() => {
            if (this.universal.isServer) return emptyRemove;
            const callback = (e: DragEvent) => {
                zone.run(() => handler(e));
            };
            const dd = DragDropHandler.get(element);
            dd.addListener(eventName, callback);
            return () => dd.removeListener(eventName, callback);
        });
    }
}
