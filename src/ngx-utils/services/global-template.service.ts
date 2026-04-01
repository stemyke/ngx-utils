import {Injectable, TemplateRef} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {ObjectUtils} from "../utils/object.utils";
import {GlobalComponentModifier} from "../common-types";

@Injectable()
export class GlobalTemplateService {

    readonly templatesUpdated: Subject<ReadonlyArray<string>>;

    protected readonly globalTemplates: { [id: string]: TemplateRef<any> };
    protected readonly componentModifiers: { [id: string]: GlobalComponentModifier };

    constructor() {
        this.templatesUpdated = new BehaviorSubject([]);
        this.globalTemplates = {};
        this.componentModifiers = {};
    }

    get(id: string, component?: any): TemplateRef<any> {
        const template = this.globalTemplates[id];
        if (!template) return undefined;
        const modifier = this.componentModifiers[id];
        if (ObjectUtils.isFunction(modifier) && component) {
            modifier(component);
        }
        return template;
    }

    add(id: string, template: TemplateRef<any>): void {
        this.globalTemplates[id] = template;
        this.templatesUpdated.next(Object.keys(this.globalTemplates));
    }

    remove(id: string): void {
        delete this.globalTemplates[id];
        this.templatesUpdated.next(Object.keys(this.globalTemplates));
    }

    addComponentModifier(id: string, modifier: GlobalComponentModifier): void {
        this.componentModifiers[id] = modifier;
    }
}
