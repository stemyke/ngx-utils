import {Injectable} from "@angular/core";
import {UniversalService} from "./universal.service";

export enum StorageMode {
    Local,
    Session
}

/**
 * Use this service instead of Storage to avoid Angular Universal breaks on server environment
 */
@Injectable()
export class StorageService {

    constructor(public universal: UniversalService) {
    }

    get(key: string, defaultValue?: any, mode: StorageMode = StorageMode.Local): any {
        if (this.universal.isServer) return defaultValue;
        const storage = mode == StorageMode.Local ? localStorage : sessionStorage;
        const item = storage.getItem(key);
        if (!item) return defaultValue;
        try {
            return JSON.parse(item);
        } catch (e) {
            return item;
        }
    }

    set(key: string, value: any, mode: StorageMode = StorageMode.Local): void {
        if (this.universal.isServer) return;
        const storage = mode == StorageMode.Local ? localStorage : sessionStorage;
        if (typeof value == "string") {
            storage.setItem(key, value);
            return;
        }
        storage.setItem(key, JSON.stringify(value));
    }

    remove(key: string, mode: StorageMode = StorageMode.Local): void {
        if (this.universal.isServer) return;
        const storage = mode == StorageMode.Local ? localStorage : sessionStorage;
        storage.removeItem(key);
    }
}
