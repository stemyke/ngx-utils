import {Injector, Type} from "@angular/core";
import {TypedFactoryProvider} from "../common-types";
import {OPTIONS_TOKEN} from "../tokens";

export function provideWithOptions<O extends Object, T = any>(type: Type<T>, options: O): TypedFactoryProvider<T> {
    return {
        useFactory: function (injector: Injector) {
            const subInjector = Injector.create({
                providers: [
                    {
                        provide: OPTIONS_TOKEN,
                        useValue: options
                    },
                    {
                        provide: type,
                        useClass: type
                    }
                ],
                parent: injector
            });
            return subInjector.get(type);
        },
        deps: [Injector]
    }
}
