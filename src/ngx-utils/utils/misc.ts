import {Type, ValueProvider, ɵComponentDef as ComponentDef} from "@angular/core";
import {CssSelector, CssSelectorList, DYNAMIC_ENTRY_COMPONENTS} from "../common-types";

export function getCssVariables(elem: HTMLElement): Record<string, string> {
    if ("computedStyleMap" in elem) {
        const styles = Array.from(elem.computedStyleMap() as any) as [string, string][];
        return styles.reduce((res, [prop, val]) => {
            if (prop.startsWith("--")) {
                res[prop] = val.toString();
            }
            return res;
        }, {} as Record<string, string>);
    }
    const res = {} as Record<string, string>;
    const styles = getComputedStyle(elem);
    for (let i = 0; i < styles.length; i++) {
        const propertyName = styles[i];
        if (propertyName.startsWith("--")) {
            res[propertyName] = styles.getPropertyValue(propertyName);
        }
    }
    return res;
}

export function checkTransitions(el: HTMLElement, cb: () => any): void {
    let hasTransitions = false;
    let called = false;
    const end = () => {
        if (called) return;
        called = true;
        cb();
    };
    el.onanimationstart = () => hasTransitions = true;
    el.ontransitionstart = () => hasTransitions = true;
    el.onanimationend = end;
    el.ontransitionend = end;
    setTimeout(() => {
        if (hasTransitions) return;
        end();
    }, 100);
}

export function getComponentDef<T>(type: Type<T>): ComponentDef<T> {
    const def = type["ɵcmp"] as ComponentDef<T>;
    if (!def) {
        throw new Error(`No Angular definition found for ${type.name}`);
    }
    return def;
}

// Helper function to match a search selector to a stored selector
export function parseSelector(selector: string | CssSelector): CssSelector {
    if (Array.isArray(selector)) {
        if (selector.length !== 1 && selector.length !== 3) {
            throw new Error("CSSSelector should contain 1 or 3 parts!");
        }
        if (selector.some(t => typeof t !== "string")) {
            throw new Error("CSSSelector parts can only be strings");
        }
        return selector;
    }
    if (selector.indexOf("#") > 0) {
        const parts = selector.split("#");
        selector = `${parts[0]}[id=${parts[1]}]`;
    }
    if (selector.indexOf(".") > 0) {
        const parts = selector.split(".");
        selector = `${parts[0]}[class=${parts[1]}]`;
    }
    const start = selector.indexOf("[");
    const end = Math.max(selector.indexOf("]"), Math.min(selector.length, start + 1));
    if (start >= 0) {
        const parts = selector.substring(start + 1, end).split("=");
        return [
            selector.substring(0, start),
            parts[0],
            parts[1] || ""
        ]
    }
    return [selector];
}

export function selectorMatchesList(list: CssSelectorList, selector: CssSelector) {
    for (const item of list) {
        if (selector.length === item.length && selector.every((s, i) => s === item[i])) {
            return true;
        }
    }
    return false;
}

export function provideEntryComponents(components: Type<any>[], moduleId?: string): ValueProvider {
    return {
        provide: DYNAMIC_ENTRY_COMPONENTS,
        useValue: {
            components,
            moduleId
        },
        multi: true
    };
}
