import {Inject, Injectable, Injector} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AUTH_SERVICE, IAuthService, IRoute, RouteValidator} from "../common-types";
import {ReflectUtils} from "./reflect.utils";
import {ObjectUtils} from "./object.utils";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(@Inject(Injector) protected injector: Injector, @Inject(Router) protected router: Router, @Inject(AUTH_SERVICE) protected auth: IAuthService) {

    }

    checkRouteMenu(route: IRoute): Promise<boolean> {
        if (!route.data || !route.data.name) return Promise.resolve(false);
        return this.checkRoute(route);
    }

    checkRoute(route: IRoute, next?: ActivatedRouteSnapshot): Promise<boolean> {
        const routeData = route.data || {};
        if (!routeData.guards)
            return Promise.resolve(!route.canActivate || this.auth.isAuthenticated);
        return new Promise<boolean>(resolve => {
            const guards = routeData.guards.map(g => {
                const guard = ReflectUtils.resolve<RouteValidator>(g, this.injector);
                return guard(this.auth, route, next);
            });
            Promise.all(guards).then(results => {
                resolve(results.indexOf(false) < 0);
            });
        });
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const route = <IRoute>next.routeConfig;
        return new Promise<boolean>(resolve => {
            this.auth.checkAuthenticated().then(() => {
                this.checkRoute(route, next).then(hasRights => {
                    resolve(hasRights);
                    if (!hasRights) {
                        this.getReturnState(route).then(returnState => {
                            if (!returnState) return;
                            this.router.navigate(returnState);
                        });
                    }
                });
            });
        });
    }

    getReturnState(route: IRoute): Promise<string[]> {
        if (!route) return Promise.resolve(null);
        if (ObjectUtils.isObject(route.data) && ObjectUtils.isArray(route.data.returnState)) {
            return Promise.resolve(route.data.returnState);
        }
        const path = [];
        const config = this.getConfig(route, this.router.config, path);
        return new Promise<string[]>(resolve => {
            this.getReturnStateRecursive(config).then(rs => {
                if (!ObjectUtils.isArray(rs)) {
                    resolve(rs);
                    return;
                }
                resolve(path.concat(rs));
            });
        });
    }

    private getReturnStateRecursive(config: IRoute[], c: number = 0): Promise<string[]> {
        if (!config || c >= config.length) return Promise.resolve(null);
        return new Promise<string[]>(resolve => {
            const route = config[c];
            const check = !route.component ? Promise.resolve(false) : this.checkRoute(route);
            check.then(res => {
                if (res) {
                    resolve([route.path]);
                    return;
                }
                this.getReturnStateRecursive(config, c + 1).then(resolve);
            });
        });
    }

    private getConfig(route: IRoute, config: IRoute[], path: string[]): IRoute[] {
        if (!config) return null;
        const match = config.findIndex(t => t == route);
        if (match >= 0) return config;
        for (let subConfig of config) {
            path.push(subConfig.path);
            const match = this.getConfig(route, subConfig.children, path);
            if (!!match) return match;
            path.length -= 1;
        }
        return null;
    }
}
