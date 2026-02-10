import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class EventsService {

    readonly eventForwarded: EventEmitter<Event>;
    readonly stickyUpdated: EventEmitter<boolean>;
    readonly languageChanged: EventEmitter<string>;
    readonly editLanguageChanged: EventEmitter<string>;

    private sticky: boolean;

    public get isSticky(): boolean {
        return this.sticky;
    }

    constructor() {
        this.eventForwarded = new EventEmitter<Event>();
        this.stickyUpdated = new EventEmitter<boolean>();
        this.languageChanged = new EventEmitter<string>();
        this.editLanguageChanged = new EventEmitter<string>();
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
