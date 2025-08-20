import "reflect-metadata";
import {Injector, TypeProvider} from "@angular/core";
import {ResolveFactory} from "../common-types";
import {ObjectUtils} from "./object.utils";

export class ReflectUtils {

    static defineMetadata(key: string, data: any, target: any, name?: string): void {
        Reflect.defineMetadata(key, data, target, name);
    }

    static getMetadata(key: string, target: any, name?: string): any {
        return Reflect.getMetadata(key, target, name);
    }

    static getOwnMetadata(key: string, target: any, name?: string): any {
        return Reflect.getOwnMetadata(key, target, name);
    }

    static resolve<T>(obj: ResolveFactory<T> | T, injector: Injector): T {
        if (!ObjectUtils.checkInterface(obj, {func: "function"})) return <T>obj;
        const factory = <ResolveFactory>obj;
        let depends: TypeProvider[];
        if (factory.type) {
            const method = ObjectUtils.getProperties(factory.type).find(function (key) {
                return factory.type[key] === factory.func;
            });
            depends = ReflectUtils.getMetadata("factoryDependencies", factory.type, method) || [];
        } else {
            depends = ReflectUtils.getMetadata("factoryDependencies", factory.func) || [];
        }
        const parameters = depends.map(function (dep) {
            return injector.get(dep);
        }).concat(factory.params);
        return factory.func.apply(null, parameters);
    }
}
