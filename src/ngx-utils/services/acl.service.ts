import {Inject, Injectable, Injector, Type} from "@angular/core";
import "rxjs/Rx";
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

    constructor(public injector: Injector, @Inject(StateService) public state: StateService, @Inject(AUTH_SERVICE) public auth: IAuthService) {
        this.components = [];
        this.auth.userChanged.subscribe(this.handleUserChanged);
        this.state.subscribe(this.handleStateChanged);
    }

    handleUserChanged = (): void => {
        this.components.forEach(t => t.dirty = true);
        const info = this.getStateInfo();
        const guard: AuthGuard = info && info.guard instanceof AuthGuard ? info.guard : null;
        if (!guard) return;
        guard.checkRoute(info.route).then(result => {
            if (result) {
                AclService.checkStateDirty(info);
                return;
            }
            const returnState = info.route.data.returnState || guard.getReturnState(info.route);
            if (returnState) this.state.navigate(returnState);
        });
    };

    handleStateChanged = (): void => {
        const info = this.getStateInfo();
        AclService.checkStateDirty(info);
    };

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
