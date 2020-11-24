import {Injectable, NgZone, Optional} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    ChildrenOutletContexts,
    Data,
    Event,
    NavigationEnd,
    NavigationExtras,
    OutletContext,
    Params,
    Route,
    Router,
    UrlSegment,
    UrlTree
} from "@angular/router";
import {BehaviorSubject, Subscription} from "rxjs";
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

    get url(): string {
        return this.stateInfo.url || "";
    }

    get urlSegments(): UrlSegment[] {
        return this.stateInfo.segments || emptySegments;
    }

    get components(): any[] {
        return this.stateInfo.components || emptyComponents;
    }

    constructor(private zone: NgZone, @Optional() private router: Router = null) {
        super(null);
        if (!this.router) return;
        this.router.events.subscribe(this.handleRouterEvent);
        this.stateInfo = {
            url: "",
            segments: [],
            components: []
        };
        this.contexts = (<any>router).rootContexts;
    }

    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.zone.run(() => {
                this.router.navigate(commands, extras).then(resolve, () => resolve(false));
            })
        });
    }

    navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
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
