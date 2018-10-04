import {Injectable} from "@angular/core";
import {IPromiseService} from "../common-types";

@Injectable()
export class PromiseService implements IPromiseService {

    promises: Promise<any>[];

    constructor() {
        this.promises = [];
    }

    create<T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T> {
        return this.add(new Promise<T>(executor));
    }

    all(promises: Promise<any>[]): Promise<any> {
        return this.add(Promise.all(promises));
    }

    resolve<T>(value: T | PromiseLike<T>): Promise<T> {
        return this.add(Promise.resolve(value));
    }

    private add<T>(promise: Promise<T>): Promise<T> {
        this.promises.push(new Promise<any>(resolve => {
            const cb = () => setTimeout(resolve);
            promise.then(cb, cb);
        }));
        return promise;
    }
}
