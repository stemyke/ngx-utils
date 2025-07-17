import {Injectable, Injector, Type} from "@angular/core";
import {StateService} from "./state.service";
import {IAclComponent, IRouteStateInfo} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {AuthGuard} from "../utils/auth.guard";
import {EventsService} from "./events.service";

const emptyGuards: any[] = [];

@Injectable()
export class AclService {

    protected components: IRouteStateInfo[];

    constructor(readonly injector: Injector,
                readonly state: StateService,
                readonly events: EventsService) {
        this.components = [];
        this.events.userChanged.subscribe(() => {
            this.components.forEach(t => t.dirty = true);
            const info = this.getStateInfo();
            const check: Promise<boolean> = info && info.guard instanceof AuthGuard ? info.guard.checkRoute(info.route) : Promise.resolve(true);
            check.then(result => {
                if (result) {
                    if (!info || !info.dirty) return;
                    info.dirty = false;
                    const component: IAclComponent = info.component;
                    if (!info.component) return;
                    if (info.first) {
                        if (ObjectUtils.isFunction(component.onUserInitialized)) {
                            component.onUserInitialized();
                        }
                        info.first = false;
                        return;
                    }
                    if (ObjectUtils.isFunction(component.onUserChanged)) {
                        component.onUserChanged();
                    }
                    return;
                }
                (info.guard as AuthGuard).getReturnState(info.route).then(returnState => {
                    if (!returnState) return;
                    this.state.navigate(returnState);
                });
            });
        });
        this.state.subscribe(() => {
            const info = this.getStateInfo();
            if (!info?.component) return;
            const component: IAclComponent = info.component;
            if (ObjectUtils.isFunction(component.onUserInitialized)) {
                component.onUserInitialized();
            }
            info.first = false;
        });
    }

    protected getStateInfo(): IRouteStateInfo {
        const route = this.state.route;
        if (!route) return null;
        let info = this.components.find(t => t.route == this.state.route);
        if (!info) {
            const guardType: Type<AuthGuard> = (route.canActivate || emptyGuards)[0];
            info = {
                route: this.state.route,
                guard: guardType ? this.injector.get(guardType) : null,
                dirty: true,
                first: true
            };
            this.components.push(info);
        }
        info.component = this.state.component;
        return info;
    }
}
