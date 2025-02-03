import {from, Observable, Subject, Subscription} from "rxjs";
import {mergeMap} from "rxjs/operators";

import {ISearchObservable} from "../common-types";
import {TimerUtils} from "./timer.utils";

export interface ISubscriberInfo {
    subjects: Observable<any>[];
    cb: (ev?: Observable<any>, ...args: any[]) => any;
    timeout?: number;
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
        // @dynamic
        const lambda = () => {
            subscriptions.forEach(s => {
                s?.unsubscribe();
            });
        };
        return new Subscription(lambda);
    }

    static subscribe(...subscribers: ISubscriberInfo[]): Subscription {
        const subscriptions: Subscription[] = [];
        subscribers.forEach(info => {
            let alreadyCalled = false;
            const timer = TimerUtils.createTimeout();
            info.subjects.forEach(subject => {
                const ss = subject.subscribe((value) => {
                    alreadyCalled = true;
                    timer.set(() => {
                        info.cb(subject, value);
                    }, info.timeout ?? 0);
                });
                subscriptions.push(ss);
            });
            if (alreadyCalled) return;
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
                    subject.error(err);
                }
            }
            return subject.subscribe(subscriber);
        });
    }
}
