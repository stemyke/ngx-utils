import {EventEmitter, Inject, Injectable, NgZone} from "@angular/core";
import {IPromiseService} from "../common-types";

@Injectable()
export class PromiseService implements IPromiseService {

    get count(): number {
        return this.promiseCount;
    }

    get onChanged(): EventEmitter<number> {
        return this.promiseChanged;
    }

    private promiseCount: number;
    private readonly promiseChanged: EventEmitter<number>;

    constructor(@Inject(NgZone) public readonly zone: NgZone) {
        this.promiseCount = 0;
        this.promiseChanged = new EventEmitter<number>();
    }

    create<T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T> {
        return this.add(this.zone.runOutsideAngular(() => new Promise<T>(executor)));
    }

    all(promises: Promise<any>[]): Promise<any> {
        return this.add(this.zone.runOutsideAngular(() => Promise.all(promises)));
    }

    resolve<T>(value: T | PromiseLike<T>): Promise<T> {
        return this.add(this.zone.runOutsideAngular(() => Promise.resolve(value)));
    }

    private promiseFinished(): void {
        if (this.promiseCount == 0) return;
        this.promiseCount--;
        this.promiseChanged.emit(this.promiseCount);
    }

    private add<T>(promise: Promise<T>): Promise<T> {
        this.promiseCount++;
        this.promiseChanged.emit(this.promiseCount);
        return new Promise<any>((resolve, reject) => {
            promise.then(v => {
                resolve(v);
                this.promiseFinished();
            }, r => {
                reject(r);
                this.promiseFinished();
            });
        });
    }
}
