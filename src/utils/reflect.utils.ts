import {Injector, TypeProvider} from "@angular/core";
import {ObjectUtils} from "./object.utils";

declare const Reflect: any;

export function FactoryDependencies(...dependencies: TypeProvider[]): MethodDecorator {
    return (target: any, method: string): void => {
        ReflectUtils.defineMetadata("factoryDependencies", dependencies, target, method);
    };
}

export interface IResolveFactory {
    func: Function;
    type?: any;
    params?: any[];
}

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

    static resolve<T>(obj: IResolveFactory | T, injector: Injector): T {
        if (!ObjectUtils.checkInterface(obj, {func: "function"})) return <T>obj;
        const factory = <IResolveFactory>obj;
        let depends: TypeProvider[] = [];
        if (factory.type) {
            const method = Object.keys(factory.type).find(t => factory.type[t] === factory.func);
            depends = ReflectUtils.getMetadata("factoryDependencies", factory.type, method) || [];
        } else {
            depends = ReflectUtils.getMetadata("factoryDependencies", factory.func) || [];
        }
        const parameters = depends.map(dep => {
            return injector.get(dep);
        }).concat(factory.params);
        return factory.func.apply(null, parameters);
    }
}
