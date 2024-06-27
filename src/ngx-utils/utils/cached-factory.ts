import {Injector, Type} from "@angular/core";

export type CachedFactory<T> = (injector: Injector) => ReadonlyArray<T>;

export function cachedFactory<T>(types: ReadonlyArray<Type<T>>): CachedFactory<T> {
    let cached: ReadonlyArray<T> = null;
    return (injector: Injector) => {
        if (cached !== null) {
            return cached;
        }
        const subInjector = Injector.create({
            providers: types.map(type => {
                return {
                    provide: type,
                    useClass: type,
                }
            }),
            parent: injector
        });
        cached = types.map(type => subInjector.get(type));
        return cached;
    };
}
