import {Observable} from "rxjs/Observable";
import "rxjs/Rx";

export interface ISearchObservable {
    search: string;
    getSearchResults(token: string): Promise<any[]>;
}

export class ObservableUtils {

    static toSearch(search: ISearchObservable): Observable<any> {
        return Observable.create((observer: any) => {
            observer.next(search.search);
        }).mergeMap(token => search.getSearchResults(token));
    }
}
