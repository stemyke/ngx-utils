import {EventEmitter, Inject, Injectable} from "@angular/core";
import {APP_BASE_HREF} from "@angular/common";
import {UrlSerializer, UrlTree} from "@angular/router";

@Injectable()
export class HrefSerializer {

    get count(): number {
        return this.promiseCount;
    }

    get onChanged(): EventEmitter<number> {
        return this.promiseChanged;
    }

    protected promiseCount: number;
    protected readonly promiseChanged: EventEmitter<number>;

    constructor(@Inject(APP_BASE_HREF) readonly baseHref: string,
                readonly urlSerializer: UrlSerializer) {
        this.promiseCount = 0;
        this.promiseChanged = new EventEmitter<number>();
    }

    serialize(url: UrlTree | string): string {
        const serialized = url instanceof UrlTree
            ? this.urlSerializer.serialize(url)
            : (url != null ? url : null);
        return serialized && serialized.startsWith("/") && !serialized.startsWith(this.baseHref)
            ? `${this.baseHref}${serialized}`.replace(/\/\/$/, "/")
            : serialized;
    }
}
