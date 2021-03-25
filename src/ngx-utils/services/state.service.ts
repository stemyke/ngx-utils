import {Injectable, Injector, NgZone, Optional} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    ChildrenOutletContexts,
    Data,
    Event,
    NavigationEnd,
    NavigationExtras,
    OutletContext,
    Params,
    Resolve,
    Route,
    Router,
    UrlSegment,
    UrlTree
} from "@angular/router";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {skipWhile} from "rxjs/operators";
import {ObjectUtils} from "../utils/object.utils";
import {IRoute} from "../common-types";

export const emptySnapshot: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
export const emptyData: Data = {id: ""};
export const emptyParams: Params = {};
export const emptySegments: UrlSegment[] = [];
export const emptyComponents: any[] = [];

export interface IStateInfo {
    url: string;
    segments: UrlSegment[];
    components: any[];
}

@Injectable()
export class StateService extends BehaviorSubject<any> {

    readonly globalExtras: NavigationExtras;

    private shot: ActivatedRouteSnapshot;
    private comp: any;
    private stateInfo: IStateInfo;
    private contexts: ChildrenOutletContexts;

    static toPath(route: Route, params: any): string {
        let path = route.path || "";
        ObjectUtils.iterate(params, (value: any, key: string) => {
            path = path.replace(`:${key}`, `${value}`);
        });
        return path;
    }

    get component(): any {
        return this.comp;
    }

    get snapshot(): ActivatedRouteSnapshot {
        return this.shot || emptySnapshot;
    }

    get route(): IRoute {
        return this.snapshot.routeConfig;
    }

    get data(): Data {
        return this.snapshot.data || emptyData;
    }

    get params(): Params {
        return this.snapshot.params || emptyParams;
    }

    get queryParams(): Params {
        return this.snapshot.queryParams || emptyParams;
    }

    get url(): string {
        return this.stateInfo.url || "";
    }

    get urlSegments(): UrlSegment[] {
        return this.stateInfo.segments || emptySegments;
    }

    get components(): any[] {
        return this.stateInfo.components || emptyComponents;
    }

    get routerConfig(): IRoute[] {
        return this.router.config;
    }

    constructor(readonly injector: Injector, readonly zone: NgZone, @Optional() readonly router: Router = null) {
        super(null);
        if (!this.router) return;
        this.globalExtras = {
            queryParamsHandling: "merge"
        };
        this.router.events.subscribe(this.handleRouterEvent);
        this.stateInfo = {
            url: "",
            segments: [],
            components: []
        };
        this.contexts = (<any>router).rootContexts;
    }

    async reload(): Promise<any> {
        const routerStateSnapshot = this.router.routerState.snapshot;
        const resolvers = this.route.resolve || {};
        const keys = Object.keys(resolvers);
        for (const key of keys) {
            const resolver = this.injector.get(resolvers[key]) as Resolve<any>;
            let resolved = resolver.resolve(this.snapshot, routerStateSnapshot);
            if (resolved instanceof Observable) {
                resolved = resolved.toPromise();
            }
            if (resolved instanceof Promise) {
                resolved = await resolved;
            }
            this.data[key] = resolved;
        }
    }

    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        if (!this.router) return Promise.resolve(false);
        extras = Object.assign({}, this.globalExtras, extras || {});
        const tree = this.router.createUrlTree(commands, extras);
        return this.navigateByUrl(tree, extras);
    }

    navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
        if (!this.router) return Promise.resolve(false);
        extras = Object.assign({}, this.globalExtras, extras || {});
        return new Promise<boolean>(resolve => {
            this.zone.run(() => {
                this.router.navigateByUrl(url, extras).then(resolve, () => resolve(false));
            })
        });
    }

    subscribeImmediately(next?: (value: ActivatedRouteSnapshot) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        return this.pipe(skipWhile(v => v == null)).subscribe(next, error, complete);
    }

    private handleRouterEvent = (event: Event): void => {
        if (!(event instanceof NavigationEnd)) return;
        const routerStateSnapshot = this.router.routerState.snapshot;
        let snapshot = routerStateSnapshot.root;
        let context: OutletContext = this.contexts.getContext("primary");
        let segments = snapshot.url;
        const components: any[] = [];
        const snapshots: ActivatedRouteSnapshot[] = [];
        while (snapshot) {
            snapshots.push(snapshot);
            segments = segments.concat(snapshot.url);
            if (context) {
                if (context.outlet && context.outlet.isActivated)
                    components.push(context.outlet.component);
                context = context.children.getContext("primary");
            }
            snapshot = snapshot.firstChild;
        }
        this.comp = components[components.length - 1];
        this.shot = snapshots[snapshots.length - 1];
        this.stateInfo = {
            url: routerStateSnapshot.url,
            segments: segments,
            components: components
        };
        this.next(this.shot);
    };
}
