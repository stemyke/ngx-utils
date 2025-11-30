import {Pipe} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {isObservable, Observable} from "rxjs";

@Pipe({
    standalone: false,
    pure: false,
    name: "syncAsync"
})
export class SyncAsyncPipe extends AsyncPipe {

    transform<T = any>(value: T | Promise<T> | Observable<T>): T {
        return isObservable(value) || (value instanceof Promise)
            ? super.transform(value)
            : value as T;
    }
}
