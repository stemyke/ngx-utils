import {Injectable} from "@angular/core";
import {IIconService} from "../common-types";

declare const icons: {
    [icon: string]: string;
};

@Injectable()
export class IconService implements IIconService {

    getIcon(icon: string, activeIcon: string, active: boolean): Promise<string> {
        icon = typeof icons == "undefined" ? icon : (icons[icon] || icon);
        activeIcon = typeof icons == "undefined" ? activeIcon : (icons[activeIcon] || icon);
        return Promise.resolve(active ? activeIcon : icon);
    }
}
