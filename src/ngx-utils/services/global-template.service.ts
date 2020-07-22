import {EventEmitter, Injectable, TemplateRef} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export type GlobalComponentModifier = (component: any) => any;

@Injectable()
export class GlobalTemplateService {

    public readonly templatesUpdated: EventEmitter<void>;

    protected globalTemplates: {[id: string]: TemplateRef<any>};
    protected componentModifiers: {[id: string]: GlobalComponentModifier};

    constructor() {
        this.templatesUpdated = new EventEmitter<any>();
        this.globalTemplates = {};
        this.componentModifiers = {};
    }

    get(id: string, component?: any): TemplateRef<any> {
        const template = this.globalTemplates[id];
        if (!template) return null;
        const modifier = this.componentModifiers[id];
        if (ObjectUtils.isFunction(modifier) && component) {
            modifier(component);
        }
        return template;
    }

    add(id: string, template: TemplateRef<any>): void {
        this.globalTemplates[id] = template;
        this.templatesUpdated.emit();
    }

    remove(id: string): void {
        delete this.globalTemplates[id];
        this.templatesUpdated.emit();
    }

    addComponentModifier(id: string, modifier: GlobalComponentModifier): void {
        this.componentModifiers[id] = modifier;
    }
}
