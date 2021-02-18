import {Subject} from "rxjs";

export class GenericValue<T> extends Subject<T> {

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        if (value == this._value) return;
        this._value = value;
        this.next(value);
    }

    private _value: T;

    constructor(value: T = null) {
        super();
        this._value = value;
    }

    setJustValue(value: T): void {
        this._value = value;
    }
}
