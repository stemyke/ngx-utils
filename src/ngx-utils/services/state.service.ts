import {Injectable, Injector, NgZone, Optional} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    ChildrenOutletContexts,
    Data,
    NavigationEnd,
    NavigationExtras,
    OutletContext,
    Params,
    Resolve,
    Route,
    Router,
    Scroll,
    UrlSegment,
    UrlTree
} from "@angular/router";
import {BehaviorSubject, firstValueFrom, Observable, Observer, Subscription} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, map, skipWhile,} from "rxjs/operators";
import {ObjectUtils} from "../utils/object.utils";
import {IRoute, NavigationUrlParam} from "../common-types";
import {UniversalService} from "./universal.service";

export const emptySnapshot = new ActivatedRouteSnapshot();
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
export class StateService {

    readonly globalExtras: NavigationExtras;

    protected $snapshot: BehaviorSubject<ActivatedRouteSnapshot>;
    protected $component: BehaviorSubject<any>;
    protected stateInfo: IStateInfo;

    static toPath(route: Route, params: any): string {
        let path = route.path || "";
        ObjectUtils.iterate(params, (value: any, key: string) => {
            path = path.replace(`:${key}`, `${value}`);
        });
        return path;
    }

    get snapshot(): ActivatedRouteSnapshot {
        return this.$snapshot.value;
    }

    get component(): any {
        return this.$component.value;
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
                @Optional() readonly router: Router = null,
                @Optional() readonly contexts: ChildrenOutletContexts = null) {
        this.globalExtras = {
            queryParamsHandling: "merge"
        };
        this.$snapshot = new BehaviorSubject(emptySnapshot);
        this.$component = new BehaviorSubject(null);
        this.stateInfo = {
            url: "",
            segments: [],
            components: []
        };
        this.router?.events
            .pipe(
                distinctUntilChanged(),
                map(event => {
                    if (event instanceof Scroll) {
                        return event.routerEvent;
                    }
                    return event;
                }),
                filter(e => e instanceof NavigationEnd),
            )
            .subscribe(() => {
                const routerStateSnapshot = this.router.routerState.snapshot;
                let snapshot = routerStateSnapshot.root;
                let context: OutletContext = this.contexts?.getContext("primary");
                let segments = snapshot.url;
                const components: any[] = [];
                const snapshots: ActivatedRouteSnapshot[] = [];
                while (snapshot) {
                    snapshots.push(snapshot);
                    segments = segments.concat(snapshot.url);
                    if (context) {
                        if (context.outlet && context.outlet.component)
                            components.push(context.outlet.component);
                        context = context.children.getContext("primary");
                    }
                    snapshot = snapshot.firstChild;
                }
                this.stateInfo = {
                    url: routerStateSnapshot.url,
                    segments: segments,
                    components: components
                };
                this.$snapshot.next(snapshots[snapshots.length - 1]);
                this.$component.next(components[components.length - 1]);
            });
    }

    async reload(): Promise<any> {
        const routerStateSnapshot = this.router.routerState.snapshot;
        const resolvers = this.route.resolve || {};
        const keys = Object.keys(resolvers);
        for (const key of keys) {
            const resolver = this.injector.get(resolvers[key]) as Resolve<any>;
            let resolved = resolver.resolve(this.snapshot, routerStateSnapshot);
            if (resolved instanceof Observable) {
                resolved = firstValueFrom(resolved);
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

    subscribeImmediately(
        next?: (value: ActivatedRouteSnapshot) => void,
        error?: (error: any) => void
    ): Subscription {
        return this.subscribe({
            next, error
        });
    }

    subscribe(osOrNext?: Partial<Observer<ActivatedRouteSnapshot>> | ((value: ActivatedRouteSnapshot) => void)): Subscription {
        return this.$snapshot.pipe(
            skipWhile(snapshot => snapshot === emptySnapshot),
            debounceTime(25)
        ).subscribe(osOrNext);
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
}
