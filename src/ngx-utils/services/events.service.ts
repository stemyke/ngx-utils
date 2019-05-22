import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class EventsService {

    public eventForwarded: EventEmitter<Event>;
    public stickyUpdated: EventEmitter<boolean>;

    private sticky: boolean;

    public get isSticky(): boolean {
        return this.sticky;
    }

    constructor() {
        this.eventForwarded = new EventEmitter<Event>();
        this.stickyUpdated = new EventEmitter<boolean>();
        this.sticky = false;
    }

    event(e: Event): void {
        this.eventForwarded.emit(e);
    }

    updateSticky(sticky: boolean): void {
        this.sticky = sticky;
        this.stickyUpdated.emit(sticky);
    }
}
