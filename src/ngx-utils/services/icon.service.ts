import {EventEmitter, Injectable} from "@angular/core";
import {IIconService} from "../common-types";

declare const icons: {
    [icon: string]: string;
};

@Injectable()
export class IconService implements IIconService {

    get isDisabled(): boolean {
        return this.disabled;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
        this.iconsLoaded.emit();
    }

    public readonly iconsLoaded: EventEmitter<any>;

    protected disabled: boolean;

    constructor() {
        this.iconsLoaded = new EventEmitter<any>();
        this.disabled = false;
    }

    getIcon(icon: string, activeIcon: string, active: boolean): Promise<string> {
        icon = typeof icons == "undefined" ? icon : (icons[icon] || icon);
        activeIcon = typeof icons == "undefined" ? activeIcon : (icons[activeIcon] || icon);
        return Promise.resolve(active ? activeIcon : icon);
    }
}
