import {LoadableElement, LoaderPromises, ScriptType} from "../common-types";

export class LoaderUtils {

    private static promises: LoaderPromises<LoadableElement> = {};

    static loadScript(src: string | URL, async: boolean = false, type: ScriptType = "text/javascript", parent?: Node, time: boolean | string = false) {
        return LoaderUtils.loadElement(src, parent, time, url => {
            const script = document.createElement("script");
            script.type = type;
            script.src = url;
            script.async = async;
            return script;
        });
    }

    static loadStyle(src: string | URL, parent?: Node, time: boolean | string = false) {
        return LoaderUtils.loadElement(src, parent, time, url => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            return link;
        });
    }

    private static updateSrc(src: string | URL, time: boolean | string): string {
        const srcStr = String(src || "");
        if (srcStr.startsWith("data:") || !time) {
            return srcStr;
        }
        const url = new URL(src);
        url.searchParams.set("time", typeof time === "string" ? time : String(Date.now()));
        return url.toString();
    }

    private static loadElement<T extends LoadableElement>(url: string | URL, parent: Node, time: boolean | string, setup: (url: string) => T): Promise<T> {
        const promises = LoaderUtils.promises as LoaderPromises<T>;
        const src = LoaderUtils.updateSrc(url, time);
        parent = parent || document;
        if (parent == document) {
            parent = document.body;
        }
        let {elem, promise} = promises[src] || {};
        if (elem) {
            if (parent === elem.parentElement) return promise;
            if (elem.parentElement) {
                elem.remove();
            }
        }
        elem = setup(src);
        promise = new Promise<T>((resolve, reject) => {
            if (elem.readyState) {
                // Internet explorer
                elem.onreadystatechange = () => {
                    if (elem.readyState === "loaded" || elem.readyState === "complete") {
                        elem.onreadystatechange = null;
                        resolve(elem);
                    }
                };
            } else {
                // Other browsers
                elem.onload = () => resolve(elem);
            }
            elem.onerror = (error: any) => reject(error);
        });
        parent.appendChild(elem);
        promises[src] = {elem, promise};
        return promise;
    }
}
