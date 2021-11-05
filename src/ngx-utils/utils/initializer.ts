import {Invokable} from "invokable";

export class Initializer<T> {

    private initialized: boolean;

    get isInitialized(): boolean {
        return this.initialized;
    }

    constructor(private callback: () => T, private shouldInit: boolean = true) {
        this.initialized = !this.shouldInit;
        // @ts-ignore
        return Invokable.create(this);
    }

    [Invokable.call](): T {
        if (this.initialized) return null;
        this.initialized = true;
        return this.callback();
    }
}

export interface Initializer<T> {
    (): T;
}
