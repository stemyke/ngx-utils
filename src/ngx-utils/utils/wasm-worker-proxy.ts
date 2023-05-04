import {IWasi, IWasmExports} from "../common-types";
import {Type} from "@angular/core";
import {JSONfn} from "./jsonfn";

interface IPromiseExecutor {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

export function workerFunction(JSONfn: any, logTimes: boolean): void {

    let wasmResolve: (instance: IWasmExports) => void = null;
    const wasmInstance: Promise<IWasmExports> = new Promise<IWasmExports>(resolve => {
        wasmResolve = resolve;
    });

    self.onmessage = function (e) {
        const data = e.data;
        const {type, payload} = data;
        switch (type) {
            case "wasm":
                const {url, wasi} = payload;
                fetch(url).then(response => response.arrayBuffer()).then(bytes => {
                    const wasiImpl = JSONfn.parse(wasi);
                    return new wasiImpl().instantiate(bytes);
                }).then(instance => {
                    wasmResolve(instance);
                    const methods = Object.getOwnPropertyNames(instance).filter(key => typeof instance[key] === "function");
                    self.postMessage({type: "methods", payload: methods});
                });
                break;
            case "call":
                wasmInstance.then(instance => {
                    const {name, id, args} = payload;
                    if (logTimes) {
                        console.time(id);
                        console.timeLog(id, `Calling ${name} ...`);
                    }
                    const func = (instance[name] as Function);
                    const result = func(...args);
                    if (logTimes) {
                        console.timeLog(id, `Called ${name}`);
                        console.timeEnd(id);
                    }
                    self.postMessage({type: "result", payload: {id, result}});
                });
                break;
        }
    };
}

export class WasmWorkerProxy {

    protected methods: Promise<string[]>;
    protected onMethods: (methods: string[]) => void;
    protected worker: Worker;
    protected promises: Map<string, IPromiseExecutor>;

    constructor(wasmPath: string, wasi: Type<IWasi>, logTimes: boolean = false) {
        this.methods = new Promise<string[]>(resolve => {
            this.onMethods = resolve;
        });
        const lt = logTimes ? "true" : "false";
        const blob = new Blob(
            [`${JSONfn.toString()} (${workerFunction.toString()})(JSONfn, ${lt})`],
            {type: 'application/javascript'}
        );
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.postMessage({
            type: "wasm",
            payload: {url: wasmPath, wasi: JSONfn.stringify(wasi), logTimes}
        });
        this.worker.onmessage = this.onMessage.bind(this);
        this.promises = new Map<string, IPromiseExecutor>();
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const res = Reflect.get(target, prop, receiver);
                if (res) {
                    return res;
                }
                return (...args: any[]) => {
                    return this.call(prop.toString(), args);
                };
            }
        });
    }

    onMessage(e: MessageEvent): void {
        const data = e.data;
        const {type, payload} = data;
        switch (type) {
            case "methods":
                this.onMethods(payload);
                break;
            case "result":
                const {id, result} = payload;
                const promise = this.promises.get(id);
                if (promise) {
                    promise.resolve(result);
                    this.promises.delete(id);
                }
                break;
        }
    }

    async call(method: string, args: any[]): Promise<any> {
        const methods = await this.methods;
        if (!methods.includes(method)) {
            throw new Error(`Method ${method} not found`);
        }
        return new Promise<any>((resolve, reject) => {
            const id = Math.random().toString(36).substring(2, 9);
            this.worker.postMessage({
                type: "call",
                payload: {name: method, id, args}
            });
            this.promises.set(id, {resolve, reject});
        });
    }
}
