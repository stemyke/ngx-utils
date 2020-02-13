import {Observable, Subject, Subscription} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {ISearchObservable} from "../common-types";

export interface ISubscriberInfo {
    subjects: Subject<any>[],
    cb: (ev?: Subject<any>, ...args: any[]) => any,
}

export class ObservableUtils {

    static toSearch(search: ISearchObservable): Observable<any> {
        return mergeMap(
            // @dynamic
            (token: string) => search.getSearchResults(token)
        )(
            Observable.create(
                // @dynamic
                (observer: any) => {
                    observer.next(search.search);
                }
            )
        );
    }

    static subscribe(...subscribers: ISubscriberInfo[]): Subscription {
        const subscriptions: Subscription[] = [];
        subscribers.forEach(info => {
            info.subjects.forEach(subject => {
                const ss = subject.subscribe(function () {
                    const args = Array.from(arguments);
                    args.unshift(subject);
                    info.cb.apply(null, args);
                });
                subscriptions.push(ss);
            });
            info.cb();
        });
        return new Subscription(() => {
            subscriptions.forEach(s => {
                s.unsubscribe();
            });
        });
    }
}
