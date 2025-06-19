import {Inject, Injectable, Type} from "@angular/core";
import {IWasi, IWasm, IWasmAsync} from "../common-types";
import {WasmWorkerProxy} from "../utils/wasm-worker-proxy";
import {UniversalService} from "./universal.service";
import {LocalHttpService} from "./local-http.service";
import {Wasi} from "../utils/wasi";
import {WASI_IMPLEMENTATION} from "../tokens";

/**
 * Use this service to load WebAssembly modules
 */
@Injectable()
export class WasmService {

    protected wasi: Type<Wasi>
    protected modules: { [url: string]: Promise<any> };
    protected workerModules: { [url: string]: any };

    constructor(protected universal: UniversalService,
                protected http: LocalHttpService,
                @Inject(WASI_IMPLEMENTATION) wasi: IWasi) {
        this.wasi = wasi.constructor as any;
    }

    async getModule<T = IWasm>(name: string): Promise<T> {
        if (!this.universal.isBrowser || !name)
            return null;
        this.modules = this.modules || {};
        this.modules[name] = this.modules[name] || this.http.get(`wasm/${name}.wasm`, {
            responseType: "arraybuffer"
        }).then(async (bytes) => {
            const wasi = new this.wasi();
            return await wasi.instantiate(bytes);
        });
        return this.modules[name] as Promise<any>;
    }

    getWorkerModule<T = IWasmAsync>(name: string): T {
        if (!this.universal.isBrowser || !name)
            return null;
        this.workerModules = this.workerModules || {};
        this.workerModules[name] = new WasmWorkerProxy(
            this.http.url(`wasm/${name}.wasm`),
            this.wasi
        );
        return this.workerModules[name] ;
    }
}
