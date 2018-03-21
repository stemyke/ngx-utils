import {Observable} from "rxjs/Observable";
import "rxjs/Rx";

export interface ISearchObservable {
    search: string;

    getSearchResults(token: string): Promise<any[]>;
}

export class ObservableUtils {

    static toSearch(search: ISearchObservable): Observable<any> {
        return Observable.create(
            // @dynamic
            (observer: any) => {
                observer.next(search.search);
            }
        ).mergeMap(
            // @dynamic
            token => search.getSearchResults(token)
        );
    }
}
