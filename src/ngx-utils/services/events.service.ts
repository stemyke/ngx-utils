import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {IUserData} from "../common-types";

@Injectable()
export class EventsService {

    readonly eventForwarded: Subject<Event>;
    readonly stickyUpdated: Subject<boolean>;
    readonly languageChanged: Subject<string>;
    readonly translationsEnabled: Subject<boolean>;
    readonly userChanged: Subject<any>;

    private sticky: boolean;
    private user: IUserData;

    get isSticky(): boolean {
        return this.sticky;
    }

    get isAuthenticated(): boolean {
        return !!this.user;
    }

    constructor() {
        this.eventForwarded = new Subject();
        this.stickyUpdated = new Subject();
        this.languageChanged = new Subject();
        this.translationsEnabled = new Subject();
        this.userChanged = new Subject();
        this.sticky = false;
        this.user = null;
        this.userChanged.subscribe(user => {
            this.user = user;
        });
    }

    event(e: Event): void {
        this.eventForwarded.next(e);
    }

    updateSticky(sticky: boolean): void {
        this.sticky = sticky;
        this.stickyUpdated.next(sticky);
    }
}
