import {Injectable, NgZone} from "@angular/core";
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
import {Subject, Subscription} from "rxjs";
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
export class StateService {

    private shot: ActivatedRouteSnapshot;
    private comp: any;
    private stateInfo: IStateInfo;
    private contexts: ChildrenOutletContexts;
    private subject: Subject<ActivatedRouteSnapshot>;

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

    constructor(private router: Router, private zone: NgZone) {
        this.router.events.subscribe(this.handleRouterEvent);
        this.stateInfo = {
            url: "",
            segments: [],
            components: []
        };
        this.contexts = (<any>router).rootContexts;
        this.subject = new Subject<ActivatedRouteSnapshot>();
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

    subscribe(next?: (value: ActivatedRouteSnapshot) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        return this.subject.subscribe(next, error, complete);
    }

    subscribeImmediately(next?: (value: ActivatedRouteSnapshot) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        if (next && this.shot) next(this.shot);
        return this.subject.subscribe(next, error, complete);
    }

    private handleRouterEvent = (event: Event): void => {
        if (!(event instanceof NavigationEnd)) return;
        const routerStateSnapshot = this.router.routerState.snapshot;
        let snapshot = routerStateSnapshot.root;
        let context: OutletContext = null;
        let segments = snapshot.url;
        const components: any[] = [];
        while (snapshot.firstChild) {
            snapshot = snapshot.firstChild;
            segments = segments.concat(snapshot.url);
            context = (context ? context.children : this.contexts).getContext("primary");
            components.push(context.outlet.component);
        }
        this.comp = context ? context.outlet.component : null;
        this.shot = snapshot;
        this.stateInfo = {
            url: routerStateSnapshot.url,
            segments: segments,
            components: components
        };
        this.subject.next(this.shot);
    };
}
