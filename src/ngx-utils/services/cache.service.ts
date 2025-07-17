import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject, delay, timer} from "rxjs";
import {DateTime} from "luxon";
import {DurationUnit} from "../common-types";
import {EventsService} from "./events.service";

@Injectable()
export class CacheService {

    get userChanged(): Observable<any> {
        return this.events.userChanged;
    }

    readonly ignore: Observable<any>;
    readonly permanent: Observable<any>;

    private caches: Map<string, any>;

    constructor(protected events: EventsService) {
        this.ignore = new BehaviorSubject(null).pipe(delay(5));
        this.permanent = new Subject();
        this.caches = new Map();
    }

    expiresIn(amount: number = 10, unit: DurationUnit = "seconds"): Observable<any> {
        const when = DateTime.now().plus({[unit]: amount}).toJSDate();
        return this.expiresAt(when);
    }

    expiresAt(when: Date): Observable<any> {
        const now = new Date().getTime();
        // Prevent negative delay
        const delay = Math.max(when.getTime() - now, 5);
        return timer(delay);
    }

    use<T>(key: string, valueCb: () => T, expires?: Observable<any>): T {
        if (this.caches.has(key)) {
            return this.caches.get(key);
        }
        const value = valueCb();
        this.caches.set(key, value);
        const subscription = (expires || this.permanent).subscribe(() => {
            this.caches.delete(key);
            subscription.unsubscribe();
        });
        return value;
    }
}
