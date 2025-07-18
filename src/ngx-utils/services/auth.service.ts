import {IAuthService} from "../common-types";

export class StaticAuthService implements IAuthService {

    get isAuthenticated() {
        return false;
    }

    checkAuthenticated(): Promise<boolean> {
        return Promise.resolve(this.isAuthenticated);
    }
}
