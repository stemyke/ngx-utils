import {Injectable} from "@angular/core";
import {IWasi, IWasmExports, TypedArray} from "../common-types";

const WASI_ESUCCESS = 0;
const WASI_EBADF = 8;
const WASI_EINVAL = 28;
const WASI_ENOSYS = 52;
const WASI_STDOUT_FILENO = 1;

const wasi_fns: string[] = [
    "emscripten_notify_memory_growth",
    "proc_exit",
    "environ_get",
    "environ_sizes_get",
    "fd_close",
    "fd_write",
    "fd_read",
    "fd_seek",
]

@Injectable({
    providedIn: "root"
})
export class Wasi implements IWasi {

    protected env: {[key: string]: string};
    protected instantiated: boolean;
    protected wasi: any;
    protected wasm: IWasmExports;
    protected envStrings: string[];

    constructor() {
        this.env = {};
        this.instantiated = false;
        this.wasi = wasi_fns.reduce((res, key) => {
            if (typeof this[key] === "function") {
                res[key] = this[key].bind(this);
            }
            return res;
        }, {});
    }

    instantiate(bytes: ArrayBuffer): Promise<IWasmExports> {
        if (this.instantiated) {
            throw new Error("WASI already instantiated");
        }
        this.instantiated = true;
        return WebAssembly.instantiate(bytes, {
            wasi_snapshot_preview1: this.wasi,
            env: this.wasi
        }).then(module => {
            const exports = module.instance.exports as any;
            this.wasm = {
                ...exports,
                writeArrayToMemory: (array: TypedArray) => {
                    const bytes = array.length * array.BYTES_PER_ELEMENT;
                    const pointer = exports.malloc(bytes);
                    const ctr = array.constructor as any;
                    const heapArray = new ctr(this.wasm.memory.buffer, pointer, array.length);
                    heapArray.set(array);
                    return pointer;
                },
                readArrayFromMemory: (pointer: number, array: TypedArray) => {
                    const ctr = array.constructor as any;
                    const heapArray = new ctr(this.wasm.memory.buffer, pointer, array.length);
                    array.set(heapArray);
                    return array;
                }
            } as IWasmExports;
            this.updateMemoryViews();
            return this.wasm;
        });
    }

    protected updateMemoryViews(): void {
        const buffer = this.wasm.memory.buffer;
        this.wasm.HEAP8 = new Int8Array(buffer);
        this.wasm.HEAP16 = new Int16Array(buffer);
        this.wasm.HEAP32 = new Int32Array(buffer);
        this.wasm.HEAPU8 = new Uint8Array(buffer);
        this.wasm.HEAPU16 = new Uint16Array(buffer);
        this.wasm.HEAPU32 = new Uint32Array(buffer);
        this.wasm.HEAPF32 = new Float32Array(buffer);
        this.wasm.HEAPF64 = new Float64Array(buffer);
    }

    protected getEnvStrings(): string[] {
        if (!this.envStrings) {
            let x;
            const env = {};
            for (x in this.env) {
                if (this.env[x] === undefined) delete env[x]; else env[x] = this.env[x]
            }
            const strings = [];
            for (x in env) {
                strings.push(x + "=" + env[x])
            }
            this.envStrings = strings
        }
        return this.envStrings;
    }

    protected stringToAscii(str, buffer) {
        const HEAP8 = this.wasm.HEAP8;
        for (let i = 0; i < str.length; ++i) {
            HEAP8[buffer++ >> 0] = str.charCodeAt(i)
        }
        HEAP8[buffer >> 0] = 0
    }

    emscripten_notify_memory_growth(memoryIndex: number): void {
        this.updateMemoryViews();
    }

    proc_exit(rval: number): void {
        console.log("proc_exit", rval);
    }

    environ_get(environ: number, environ_buf: number): number {
        if (!this.wasm.HEAP8.byteLength) {
            this.emscripten_notify_memory_growth(0);
        }
        const HEAPU32 = this.wasm.HEAPU32;
        let bufSize = 0;
        this.getEnvStrings().forEach((str: string, i: number) => {
            const ptr = environ_buf + bufSize;
            HEAPU32[environ + i * 4 >> 2] = ptr;
            this.stringToAscii(str, ptr);
            bufSize += str.length + 1
        });
        return 0
    }

    environ_sizes_get(penviron_count: number, penviron_buf_size: number): number {
        if (!this.wasm.HEAP8.byteLength) {
            this.emscripten_notify_memory_growth(0);
        }
        const HEAPU32 = this.wasm.HEAPU32;
        const strings = this.getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        let bufSize = 0;
        strings.forEach(function (string) {
            bufSize += string.length + 1
        });
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0
    }

    fd_close(fd: number): number {
        return WASI_ESUCCESS;
    }

    fd_write(fd: number, iovs: number, iovs_len: number, nwritten: number): number {
        if (fd !== WASI_STDOUT_FILENO) {
            return WASI_EBADF;
        }
        if (iovs_len !== 1) {
            return WASI_ENOSYS;
        }
        const len = this.wasm.HEAPU32[iovs + 4 >> 2];
        this.wasm.HEAPU32[nwritten >> 2] = len;
        return WASI_ESUCCESS;
    }

    fd_read(fd: number, iovs: number, iovs_len: number, nread: number): number {
        return WASI_EINVAL;
    }

    fd_seek(fd: number, offset: number, whence: number, newOffset: number): number {
        return WASI_EINVAL;
    }
}
