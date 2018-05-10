import {Observable} from "rxjs";
import {mergeMap} from "rxjs/operators";

export interface ISearchObservable {
    search: string;

    getSearchResults(token: string): Promise<any[]>;
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
}
