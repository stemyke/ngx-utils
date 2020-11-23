import {from, Observable, Subject, Subscription} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {canReportError} from "rxjs/internal/util/canReportError";

import {ISearchObservable} from "../common-types";

export interface ISubscriberInfo {
    subjects: Observable<any>[],
    cb: (ev?: Observable<any>, ...args: any[]) => any,
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

    static multiSubscription(...subscriptions: Subscription[]): Subscription {
        return new Subscription(() => {
            subscriptions.forEach(s => {
                s.unsubscribe();
            });
        });
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
        return ObservableUtils.multiSubscription(...subscriptions);
    }

    static fromFunction(callbackFunc: () => any): Observable<any> {
        let subject: any;
        return new Observable<any>((subscriber) => {
            if (!subject) {
                subject = new Subject();
                try {
                    subject = from(callbackFunc());
                } catch (err) {
                    if (canReportError(subject)) {
                        subject.error(err);
                    } else {
                        console.warn(err);
                    }
                }
            }
            return subject.subscribe(subscriber);
        });
    }
}
