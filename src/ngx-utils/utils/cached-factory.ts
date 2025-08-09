import {InjectionToken, Injector, Provider, Type} from "@angular/core";
import {CachedFactory, TypedProvider} from "../common-types";

const CACHED_TOKEN = new InjectionToken("cached-factory-token");

export function createTypedProvider<T>(provide: InjectionToken<T>, p: TypedProvider<T>, multi: boolean = false): Provider {
    if (("useFactory" in p && "deps" in p) || "useValue" in p || "useExisting" in p || "useClass" in p) {
        return {
            provide,
            multi,
            ...p
        } as Provider;
    }
    if ("useToken" in p) {
        return {
            provide,
            multi,
            useFactory: (i: T) => i,
            deps: [p.useToken]
        };
    }
    return {
        provide,
        multi,
        useClass: p as Type<T>
    };
}

export function cachedFactory<T>(providers: TypedProvider<T>[]): CachedFactory<T> {
    let cached: ReadonlyArray<T> = null;
    return (injector: Injector) => {
        if (cached !== null) {
            return cached;
        }
        const subInjector = Injector.create({
            providers: providers.map(p=> createTypedProvider(CACHED_TOKEN, p, true)),
            parent: injector
        });
        cached = subInjector.get(CACHED_TOKEN) as ReadonlyArray<T>;
        return cached;
    };
}
