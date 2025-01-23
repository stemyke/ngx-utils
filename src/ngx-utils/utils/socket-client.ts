import {BehaviorSubject, Subject, Subscription} from "rxjs";
import type {ManagerOptions, SocketOptions, Socket} from "socket.io-client";

export type SocketFactory = (uri?: string, opts?: Partial<ManagerOptions & SocketOptions>) => Socket;

export type SocketDataValue = string | number | boolean | Date | Array<SocketDataValue> | Array<SocketDataObj>;

export interface SocketDataObj {
    [key: string]: SocketDataValue | SocketDataObj;
}

export type SocketData = SocketDataValue | SocketDataObj;

export type ExtraHeaders = Record<string, string>;

export interface ResponseHandler {
    resolve: (data: SocketData) => void,
    reject: (error: SocketData) => void
}

function uuid(): string {
    if (typeof window !== "undefined" && typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined") {
        const buf = new Uint16Array(8);
        window.crypto.getRandomValues(buf);
        return Array.from(buf).map(pad4).join("");
    }
    return new Array(8).fill(0).map(random4).join("");
}

function pad4(num: number, index: number): string {
    const prefix = 1 < index && index < 6 ? "-" : "";
    let ret = num.toString(16);
    while (ret.length < 4) {
        ret = "0" + ret;
    }
    return prefix + ret;
}

function random4(_: number, index: number): string {
    const prefix = 1 < index && index < 6 ? "-" : "";
    return prefix + Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

export class SocketClient {

    readonly status: BehaviorSubject<boolean>;

    protected readonly channels: Map<string, Subject<SocketData>>;
    protected readonly responseHandlers: Map<string, ResponseHandler>;
    protected sid: string;
    protected open: boolean;

    protected factory: Promise<SocketFactory>;
    protected ws: Promise<Socket>;

    get id(): string {
        return this.open ? this.sid : null;
    }

    constructor(readonly url: string,
                protected ioLoader: () => Promise<SocketFactory>) {
        this.status = new BehaviorSubject(false);
        this.channels = new Map([
            ["connect", new Subject<SocketData>()],
            ["disconnect", new Subject<SocketData>()],
            ["error", new Subject<SocketData>()]
        ]);
        this.responseHandlers = new Map();
        this.sid = null;
        this.open = false;
    }

    connect(extraHeaders: ExtraHeaders = {}): void {
        if (this.ws) return;
        const url = new URL(this.url);
        this.factory = this.factory || this.ioLoader();
        this.ws = new Promise((resolve, reject) => {
            this.factory.then(io => {
                const protocol = url.protocol.replace("http", "ws");
                const ws = io(`${protocol}//${url.host}`, {
                    extraHeaders,
                    timeout: 5000,
                    path: url.pathname
                });
                console.log(`socket connecting to: ${protocol}//${url.host}`, url.pathname);
                ws.on(`connect`, () => {
                    console.log(`socket connected`);
                    this.open = true;
                    this.sid = ws.id;
                    this.status.next(true);
                });
                ws.on(`disconnect`, () => {
                    this.open = false;
                    this.status.next(false);
                });
                Object.keys(this.channels).map(event => {
                    ws.on(event, (data: SocketData) => {
                        this.handleResponse(event, data);
                        this.channels[event].next(data);
                    });
                });
                resolve(ws);
            }, reject);
        });
    }

    disconnect(): void {
        if (!this.ws) return;
        this.ws.then(ws => ws.disconnect());
        this.ws = null;
    }

    subscribe<T = SocketData>(event: string, cb: (value: T) => void): Subscription {
        if (!this.channels[event]) {
            this.channels[event] = new Subject();
            this.ws?.then(ws => {
                ws.on(event, (data: SocketData) => {
                    this.handleResponse(event, data);
                    this.channels[event].next(data);
                });
            });
        }
        return this.channels[event].subscribe(cb);
    }

    emit(event: string, content: SocketData): void {
        this.ws.then(ws => ws.emit(event, content));
    }

    async request(event: string, content: SocketDataObj): Promise<any> {
        const id = uuid();
        const ws = await this.ws;
        const promise = new Promise((resolve, reject) => {
            this.responseHandlers.set(id, {resolve, reject});
            setTimeout(() => {
                this.responseHandlers.delete(id);
                reject(`Timeout for ${event} request ${JSON.stringify(content)}`);
            }, 5000);
        });
        ws.emit(event, {...content, immediate_response_id: id});
        return promise;
    }

    protected handleResponse(event: string, content: SocketData): void {
        if (typeof content !== "object" || Array.isArray(content) || content instanceof Date) return;
        const id = content.immediate_response_id as string;
        const handler = this.responseHandlers.get(id);
        if (!handler) return;
        this.responseHandlers.delete(id);
        if (event === "error") {
            handler.reject(content);
            return;
        }
        handler.resolve(content);
    }
}
