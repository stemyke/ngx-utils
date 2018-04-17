import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class EventsService {

    public eventForwarded: EventEmitter<Event>;

    constructor() {
        this.eventForwarded = new EventEmitter<Event>();
    }

    event(e: Event): void {
        this.eventForwarded.emit(e);
    }
}
