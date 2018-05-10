import {Inject, Injectable, Injector, Type} from "@angular/core";
import {StateService} from "./state.service";
import {AUTH_SERVICE, IAclComponent, IAuthService, IRouteStateInfo} from "../common-types";
import {AuthGuard, ObjectUtils} from "../utils";

const emptyGuards: any[] = [];

@Injectable()
export class AclService {

    private components: IRouteStateInfo[];

    private static checkStateDirty(info: IRouteStateInfo) {
        if (!info || !info.dirty) return;
        info.dirty = false;
        if (!ObjectUtils.checkInterface(info.component, {
            onUserInitialized: "function",
            onUserChanged: "function"
        })) return;
        const component: IAclComponent = info.component;
        if (info.first) {
            component.onUserInitialized();
            info.first = false;
            return;
        }
        component.onUserChanged();
    }

    constructor(public injector: Injector, public state: StateService, @Inject(AUTH_SERVICE) public auth: IAuthService) {
        this.components = [];
        this.auth.userChanged.subscribe(() => {
            this.components.forEach(t => t.dirty = true);
            const info = this.getStateInfo();
            const check: Promise<boolean> = info && info.guard instanceof AuthGuard ? info.guard.checkRoute(info.route) : Promise.resolve(true);
            check.then(result => {
                if (result) {
                    AclService.checkStateDirty(info);
                    return;
                }
                const returnState = info.route.data.returnState || info.guard.getReturnState(info.route);
                if (returnState) this.state.navigate(returnState);
            });
        });
        this.state.subscribe(() => {
            const info = this.getStateInfo();
            AclService.checkStateDirty(info);
        });
    }

    private getStateInfo(): IRouteStateInfo {
        const route = this.state.route;
        if (!route) return null;
        let info = this.components.find(t => t.route == this.state.route);
        if (!info) {
            const guardType: Type<AuthGuard> = (route.canActivate || emptyGuards)[0];
            info = {
                route: this.state.route,
                component: this.state.component,
                guard: guardType ? this.injector.get(guardType) : null,
                dirty: false,
                first: true
            };
            this.components.push(info);
        }
        return info;
    }
}
