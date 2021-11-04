import {Inject, Injectable, Injector} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlSegment} from "@angular/router";
import {AUTH_SERVICE, FactoryDependencies, IAuthService, IRoute, RouteValidator} from "../common-types";
import {ReflectUtils} from "./reflect.utils";
import {ObjectUtils} from "./object.utils";
import {StateService} from "../services/state.service";

@Injectable()
export class AuthGuard implements CanActivate {

    static guardAuthenticated(auth: IAuthService): Promise<boolean> {
        return Promise.resolve(auth.isAuthenticated);
    }

    static guardNotAuthenticated(auth: IAuthService): Promise<boolean> {
        return Promise.resolve(!auth.isAuthenticated);
    }

    static guardNothing(): Promise<boolean> {
        return Promise.resolve(true);
    }

    @FactoryDependencies(AUTH_SERVICE)
    static guardAuthField(auth: IAuthService, expression: string = `auth.isAuthenticated`): RouteValidator {
        // @dynamic
        const lambda = (): Promise<boolean> => {
            return Promise.resolve(ObjectUtils.evaluate(expression, {auth}));
        };
        return lambda;
    }

    @FactoryDependencies(StateService)
    static guardStateField(state: StateService, expression: string = `state.data`): RouteValidator {
        // @dynamic
        const lambda = (): Promise<boolean> => {
            return Promise.resolve(ObjectUtils.evaluate(expression, {state}));
        };
        return lambda;
    }

    @FactoryDependencies(AUTH_SERVICE, StateService)
    static guardAuthStateField(auth: IAuthService, state: StateService, expression: string = `auth.isAuthenticated`): RouteValidator {
        // @dynamic
        const lambda = (): Promise<boolean> => {
            return Promise.resolve(ObjectUtils.evaluate(expression, {auth, state}));
        };
        return lambda;
    }

    static wildRouteMatch(segments: UrlSegment[]) {
        return {consumed: segments};
    }

    static noRouteMatch() {
        return null;
    }

    constructor(@Inject(Injector) readonly injector: Injector,
                @Inject(StateService) readonly state: StateService,
                @Inject(AUTH_SERVICE) readonly auth: IAuthService) {
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
                            console.log(returnState, next.queryParams);
                            this.state.navigate(returnState, {queryParams: next.queryParams});
                        });
                    }
                });
            });
        });
    }

    getConfig(route: IRoute, config: IRoute[], path: string[]): IRoute[] {
        if (!config) return null;
        const match = config.findIndex(t => t == route);
        if (match >= 0) return config;
        for (const subConfig of config) {
            path.push(subConfig.path);
            const loadedChildren = (subConfig["_loadedConfig"] || {routes: null}).routes;
            const match = this.getConfig(route, subConfig.children || loadedChildren, path);
            if (!!match) return match;
            path.length -= 1;
        }
        return null;
    }

    getReturnState(route: IRoute): Promise<string[]> {
        if (!route) return Promise.resolve(null);
        if (ObjectUtils.isObject(route.data) && ObjectUtils.isArray(route.data.returnState)) {
            return Promise.resolve(route.data.returnState);
        }
        const path = [];
        const config = this.getConfig(route, this.state.routerConfig, path);
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
}
