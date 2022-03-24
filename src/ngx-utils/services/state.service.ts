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
    UrlSegment, UrlSerializer,
    UrlTree
} from "@angular/router";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {skipWhile} from "rxjs/operators";
import {ObjectUtils} from "../utils/object.utils";
import {IRoute, NavigationUrlParam} from "../common-types";
import {UniversalService} from "./universal.service";

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

    constructor(readonly injector: Injector,
                readonly zone: NgZone,
                readonly universal: UniversalService,
                @Optional() readonly router: Router = null) {
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

    async navigateByUrl(url: string | UrlTree, navigationExtras: NavigationExtras = {}): Promise<boolean> {
        return this.navigate(url, navigationExtras);
    }

    async navigate(url: NavigationUrlParam, navigationExtras: NavigationExtras = {}): Promise<boolean> {
        if (!this.router) return false;
        const [tree, extras] = this.createUrlTree(url, navigationExtras);
        return this.zone.run(() => {
            return this.router.navigateByUrl(tree, extras);
        });
    }

    async open(url: NavigationUrlParam, target = "_blank", navigationExtras: NavigationExtras = {}): Promise<boolean> {
        if (!this.router) return false;
        const [tree, extras] = this.createUrlTree(url, navigationExtras);
        return this.zone.run(() => {
            return this.openInNewWindow(tree, target) || this.router.navigateByUrl(tree, extras);
        });
    }

    subscribeImmediately(next?: (value: ActivatedRouteSnapshot) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        return this.pipe(skipWhile(v => v == null)).subscribe(next, error, complete);
    }

    protected openInNewWindow(tree: UrlTree, target: string): boolean {
        if (!this.universal.isBrowser) return false;
        const baseUrl = window.location.href.replace(this.router.url, "");
        try {
            const serialized = this.router.serializeUrl(tree);
            const separator = serialized.startsWith("/") ? "" : "/";
            window.open(baseUrl + separator + serialized, target);
            return true;
        } catch (e) {
            console.log(`Can't open new window: ${e}`);
            return false;
        }
    }

    protected createUrlTree(url: NavigationUrlParam, extras?: NavigationExtras): [UrlTree, NavigationExtras] {
        if (!this.router) return null;
        extras = Object.assign(extras, this.globalExtras, extras || {});
        if (ObjectUtils.isArray(url)) {
            return [this.router.createUrlTree(url, extras), extras]
        }
        if (ObjectUtils.isString(url)) {
            return [this.router.parseUrl(url), extras];
        }
        return [url, extras];
    }

    protected handleRouterEvent = (event: Event): void => {
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
