import {IRoute, IAuthService} from "../common-types";

export class StaticAuthService implements IAuthService {

    get isAuthenticated(): boolean {
        return true;
    }

    checkAuthenticated(): Promise<boolean> {
        return Promise.resolve(this.isAuthenticated);
    }

    getReturnState(route: IRoute): string[] {
        return null;
    }
}
