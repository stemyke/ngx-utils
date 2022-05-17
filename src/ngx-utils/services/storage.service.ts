import {Injectable} from "@angular/core";
import {StorageMode} from "../common-types";
import {UniversalService} from "./universal.service";

/**
 * Use this service instead of Storage to avoid Angular Universal breaks on server environment
 */
@Injectable()
export class StorageService {

    constructor(readonly universal: UniversalService) {
    }

    get(key: string, defaultValue?: any, mode: StorageMode = StorageMode.Local): any {
        if (!this.universal.isBrowser) return defaultValue;
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
        if (!this.universal.isBrowser) return;
        const storage = mode == StorageMode.Local ? localStorage : sessionStorage;
        if (typeof value == "string") {
            storage.setItem(key, value);
            return;
        }
        storage.setItem(key, JSON.stringify(value));
    }

    remove(key: string, mode: StorageMode = StorageMode.Local): void {
        if (!this.universal.isBrowser) return;
        const storage = mode == StorageMode.Local ? localStorage : sessionStorage;
        storage.removeItem(key);
    }
}
