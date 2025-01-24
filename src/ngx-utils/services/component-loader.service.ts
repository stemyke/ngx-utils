import {
    ApplicationRef,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    Inject,
    Injectable,
    Injector,
    NgModuleRef,
    Optional,
    Type,
    ViewRef
} from "@angular/core";
import {Route, Router} from "@angular/router";
import {firstValueFrom, Observable} from "rxjs";

import {
    CssSelectorList,
    DYNAMIC_ENTRY_COMPONENTS,
    DYNAMIC_MODULE_INFO,
    DynamicComponentLocation,
    DynamicModuleInfo,
    ROOT_ELEMENT
} from "../common-types";
import {getComponentDef, parseSelector, selectorMatchesList} from "../utils/misc";

interface LoadedRouterConfig {
    routes: Route[];
    injector: EnvironmentInjector | undefined;
}

interface RouterConfigLoader {
    loadChildren(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig>;
}

interface NavigationTransitions {
    configLoader: RouterConfigLoader;
}

@Injectable()
export class ComponentLoaderService {

    private readonly typeMap: Array<[string, CssSelectorList, Type<any>]>;
    private readonly moduleRegistry: DynamicModuleInfo[];
    private readonly moduleMap: Map<string, Promise<EnvironmentInjector>>;

    get injector(): Injector {
        return this.ngModule.injector;
    }

    constructor(
        protected appRef: ApplicationRef,
        protected ngModule: NgModuleRef<any>,
        @Inject(ROOT_ELEMENT) protected rootElement: HTMLElement,
        @Optional() @Inject(DYNAMIC_MODULE_INFO) moduleRegistry: DynamicModuleInfo[]
    ) {
        this.typeMap = [];
        this.moduleRegistry = moduleRegistry || [];
        this.moduleMap = new Map();
        this.populateTypeMap("root", this.ngModule.injector);
    }

    findComponentType<T>(selector: string, moduleId: string = "root"): Type<T> {
        const cssSelector = parseSelector(selector);
        const results = new Map<string, Type<any>>();
        for (const item of this.typeMap) {
            if (selectorMatchesList(item[1], cssSelector)) {
                results.set(item[0], item[2]);
            }
        }
        const keys = Array.from(results.keys());
        const result = results.get(moduleId) || results.get(keys[0]);
        if (!result) {
            throw new Error(`Cannot find component by selector: ${selector} in module '${moduleId}' nor in any other module`);
        }
        return result;
    }

    async getComponentType(location: DynamicComponentLocation): Promise<Type<any>> {

        // Find module info
        const moduleInfoList = this.moduleRegistry
            .filter(info => info.moduleId === location.moduleId);

        if (moduleInfoList.length > 1) {
            throw new Error(`Module with id '${location.moduleId}' has been declared more than once.`)
        }

        const moduleInfo = moduleInfoList[0];

        if (!moduleInfo) {
            throw new Error(`Module with id '${location.moduleId}' not found.`);
        }

        await this.loadModule(moduleInfo);

        return this.findComponentType(location.selector, location.moduleId);
    }

    createComponent(componentType: Type<any>, projectableNodes?: any[], injector?: Injector, split?: boolean): ComponentRef<any> {
        if (projectableNodes) {
            projectableNodes = split ? projectableNodes.filter(node => {
                return node && node.nodeType !== Node.COMMENT_NODE;
            }).map(node => [node]) : [projectableNodes];
        } else {
            projectableNodes = [];
        }
        return createComponent(componentType, {
            environmentInjector: this.appRef.injector,
            elementInjector: injector || this.injector,
            projectableNodes
        });
    }

    bootstrap<T>(componentType: Type<T>, rootSelectorOrNode?: string | any): ComponentRef<T> {
        rootSelectorOrNode = rootSelectorOrNode || this.rootElement;
        return !rootSelectorOrNode ? null : this.appRef.bootstrap(componentType, rootSelectorOrNode);
    }

    attachView(viewRef: ViewRef): void {
        if (!viewRef) return;
        this.appRef.attachView(viewRef);
    }

    detachView(viewRef: ViewRef): void {
        if (!viewRef) return;
        this.appRef.detachView(viewRef);
        try {
            viewRef.destroy();
        } catch (e) {
            console.log(`Can't destroy view, maybe it is already destroyed?`);
        }
    }

    private populateTypeMap(moduleId: string, injector: EnvironmentInjector): void {
        const entries = injector.get(DYNAMIC_ENTRY_COMPONENTS) || [];
        if (entries.length == 0) {
            console.warn("Entry components not found in the module", injector);
        }
        entries.forEach(entryComponents => {
            entryComponents.components.forEach(type => {
                const def = getComponentDef(type);
                this.typeMap.push([entryComponents.moduleId || moduleId, def.selectors as any, type]);
            });
        });
    }

    private async loadModule(moduleInfo: DynamicModuleInfo): Promise<EnvironmentInjector> {
        if (this.moduleMap.has(moduleInfo.moduleId)) {
            return this.moduleMap.get(moduleInfo.moduleId);
        }
        this.moduleMap.set(moduleInfo.moduleId, new Promise(async resolve => {
            const router = this.injector.get(Router);
            const loader = (router["navigationTransitions"] as NavigationTransitions).configLoader;
            const loaded = await firstValueFrom(loader.loadChildren(this.injector, {
                loadChildren: moduleInfo.loadChildren
            }));
            if (moduleInfo.routes) {
                router.resetConfig(moduleInfo.routes);
                if (moduleInfo.initialNavigation !== false) {
                    router.initialNavigation();
                }
            }
            this.populateTypeMap(moduleInfo.moduleId, loaded.injector);
            resolve(loaded.injector);
        }));
        return this.moduleMap.get(moduleInfo.moduleId);
    }
}
