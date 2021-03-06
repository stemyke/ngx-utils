import {EventEmitter} from "@angular/core";
import {IRoute, IAuthService} from "../common-types";

export class StaticAuthService implements IAuthService {

    isAuthenticated: boolean = true;
    userChanged: EventEmitter<any> = new EventEmitter<any>();

    checkAuthenticated(): Promise<boolean> {
        return Promise.resolve(this.isAuthenticated);
    }

    getReturnState(route: IRoute): string[] {
        return null;
    }
}
