import {Inject, Injector} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AUTH_SERVICE, IAuthService, IRoute, RouteValidator} from "../common-types";
import {ReflectUtils} from "./reflect.utils";

export class AuthGuard implements CanActivate {

    constructor(protected injector: Injector, @Inject(Router) protected router: Router, @Inject(AUTH_SERVICE) protected auth: IAuthService) {

    }

    checkRouteMenu(route: IRoute): Promise<boolean> {
        if (!route.data || !route.data.name) return Promise.resolve(false);
        return this.checkRoute(route);
    }

    checkRoute(route: IRoute): Promise<boolean> {
        const routeData = route.data;
        if (!routeData.guards)
            return Promise.resolve(!route.canActivate || this.auth.isAuthenticated);
        return new Promise<boolean>(resolve => {
            const guards = routeData.guards.map(g => {
                const guard = ReflectUtils.resolve<RouteValidator>(g, this.injector);
                return guard(this.auth);
            });
            Promise.all(guards).then(results => {
                resolve(results.indexOf(false) < 0);
            });
        });
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const route = <IRoute>next.routeConfig;
        const returnState = route.data.returnState || this.auth.getReturnState(route);
        return new Promise<boolean>(resolve => {
            this.auth.checkAuthenticated().then(authenticated => {
                if (!authenticated) {
                    resolve(false);
                    if (returnState) {}
                        this.router.navigate(returnState);
                }
                this.checkRoute(route).then(hasRights => {
                    resolve(hasRights);
                    if (!hasRights && returnState){}
                        this.router.navigate(returnState);
                });
            });
        });
    }
}
