import {Inject, Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {API_SERVICE, AUTH_SERVICE, IApiService, IAuthService, SOCKET_IO_PATH} from "../common-types";
import {ExtraHeaders, SocketClient, SocketData, SocketDataObj} from "../utils/socket-client";
import {LoaderUtils} from "../utils/loader.utils";

@Injectable()
export class SocketService implements OnDestroy {

    protected client: SocketClient;
    protected authSub: Subscription;

    get status(): BehaviorSubject<boolean> {
        return this.client.status;
    }

    get id(): string {
        return this.client.id;
    }

    constructor(@Inject(AUTH_SERVICE) readonly auth: IAuthService,
                @Inject(API_SERVICE) readonly api: IApiService,
                @Inject(SOCKET_IO_PATH) protected ioPath: string) {

        const url = this.api.url(this.ioPath);
        this.client = new SocketClient(url, async () => {
            let script: HTMLScriptElement = null;
            try {
                script = await LoaderUtils.loadScript(`${url}/socket.io.js`);
            } catch (e) {
                script?.remove();
                await LoaderUtils.loadScript(`https://cdn.socket.io/4.7.4/socket.io.min.js`);
            }
            return window["io"];
        });
    }

    withAuth(extraHeaders: ExtraHeaders = {}): void {
        this.authSub = this.auth.userChanged.subscribe(user => {
            if (user) {
                this.connect(extraHeaders);
                return;
            }
            this.disconnect();
        });
        if (this.auth.isAuthenticated) {
            this.connect(extraHeaders);
        }
    }

    ngOnDestroy(): void {
        this.authSub?.unsubscribe();
        this.disconnect();
    }

    connect(extraHeaders: ExtraHeaders = {}): void {
        if (this.authSub && this.auth.isAuthenticated) {
            extraHeaders = {
                ...(extraHeaders || {}),
                ...Object.entries(this.api.client.requestHeaders || {}).reduce((res, entry) => {
                    res[entry[0]] = Array.isArray(entry[1]) ? entry[1].join(", ") : entry[1];
                    return res;
                }, {})
            };
        }
        this.client.connect(extraHeaders);
    }

    disconnect(): void {
        this.client.disconnect();
    }

    subscribe(event: string, cb: (value: SocketData) => void): Subscription {
        return this.client.subscribe(event, cb);
    }

    emit(event: string, content: SocketData): void {
        this.client.emit(event, content);
    }

    request(event: string, content: SocketDataObj): Promise<any> {
        return this.client.request(event, content);
    }
}
