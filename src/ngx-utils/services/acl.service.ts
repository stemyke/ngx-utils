import {Injectable, Injector, Type} from "@angular/core";
import {StateService} from "./state.service";
import {IAclComponent, IAclService, IRouteStateInfo, MenuItem} from "../common-types";
import {ObjectUtils} from "../utils/object.utils";
import {AuthGuard} from "../utils/auth.guard";
import {EventsService} from "./events.service";

const emptyGuards: any[] = [];

@Injectable()
export class AclService implements IAclService {

    protected components: IRouteStateInfo[];

    constructor(readonly injector: Injector,
                readonly state: StateService,
                readonly events: EventsService) {
        this.components = [];
        this.events.userChanged.subscribe(async () => {
            this.components.forEach(t => t.dirty = true);
            const info = this.getStateInfo();
            const result = info && info.guard instanceof AuthGuard
                ? await info.guard.checkRoute(info.route)
                : true;
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
            const returnState = await (info.guard as AuthGuard).getReturnState(info.route);
            if (!returnState) return;
            await this.state.navigate(returnState);
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

    async getCurrentMenu(): Promise<MenuItem[]> {
        const path = [] as string[];
        const config = this.state.getConfig(this.state.route, path);
        const checks = await Promise.all(config.map(async route => {
            if (!ObjectUtils.isStringWithValue(route.data?.name)) return false;
            const guardType: Type<AuthGuard> = (route.canActivate || []).find(g => g === AuthGuard);
            const guard = !guardType ? null : this.injector.get(guardType);
            return guard ? await guard.checkRoute(route) : true;
        }));
        const basePath = path.join("/").replace(/^([a-z]+)/gi, `/$1`);
        return config.map((route, index) => {
            return !checks[index] ? null : {
                path: `${basePath}/${route.path}`,
                page: route.data.page || route.data.id,
                label: route.data.name,
                side: route.data.side || `left`,
                external: false,
                data: route.data
            };
        }).filter(Boolean);
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
