import {InjectionToken, Injector, Type} from "@angular/core";
import {CachedFactory, CachedProvider} from "../common-types";

const CACHED_TOKEN = new InjectionToken("cached-factory-token");

export function cachedFactory<T>(providers: CachedProvider<T>[]): CachedFactory<T> {
    let cached: ReadonlyArray<T> = null;
    return (injector: Injector) => {
        if (cached !== null) {
            return cached;
        }
        const subInjector = Injector.create({
            providers: providers.map(p => {
                if (("useFactory" in p && "deps" in p) || "useValue" in p) {
                    return {
                        provide: CACHED_TOKEN,
                        multi: true,
                        ...p
                    } as any;
                }
                return {
                    provide: CACHED_TOKEN,
                    multi: true,
                    useClass: p as Type<T>
                };
            }),
            parent: injector
        });
        cached = subInjector.get(CACHED_TOKEN) as ReadonlyArray<T>;
        return cached;
    };
}
