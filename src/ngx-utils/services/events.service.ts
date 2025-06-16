import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class EventsService {

    readonly eventForwarded: EventEmitter<Event>;
    readonly stickyUpdated: EventEmitter<boolean>;
    readonly languageChanged: EventEmitter<string>;
    readonly translationsEnabled: EventEmitter<boolean>;

    private sticky: boolean;

    public get isSticky(): boolean {
        return this.sticky;
    }

    constructor() {
        this.eventForwarded = new EventEmitter();
        this.stickyUpdated = new EventEmitter();
        this.languageChanged = new EventEmitter();
        this.translationsEnabled = new EventEmitter();
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
