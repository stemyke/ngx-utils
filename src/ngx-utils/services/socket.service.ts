import {Inject, Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {IApiService} from "../common-types";
import {ExtraHeaders, SocketClient, SocketData, SocketDataObj} from "../utils/socket-client";
import {LoaderUtils} from "../utils/loader.utils";
import {API_SERVICE, SOCKET_IO_PATH} from "../tokens";
import {EventsService} from "./events.service";

@Injectable()
export class SocketService implements OnDestroy {

    protected client: SocketClient;
    protected userSub: Subscription;

    get status(): BehaviorSubject<boolean> {
        return this.client.status;
    }

    get id(): string {
        return this.client.id;
    }

    constructor(@Inject(API_SERVICE) readonly api: IApiService,
                @Inject(SOCKET_IO_PATH) protected ioPath: string,
                protected events: EventsService) {

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
        this.userSub = this.events.userChanged.subscribe(user => {
            if (user) {
                this.connect(extraHeaders);
                return;
            }
            this.disconnect();
        });
        if (this.events.isAuthenticated) {
            this.connect(extraHeaders);
        }
    }

    ngOnDestroy(): void {
        this.userSub?.unsubscribe();
        this.disconnect();
    }

    connect(extraHeaders: ExtraHeaders = {}): void {
        if (this.userSub && this.events.isAuthenticated) {
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
