import {ScriptType, ILoaderPromises, ILoadableElement} from "../common-types";

export class LoaderUtils {

    private static promises: ILoaderPromises<ILoadableElement> = {};

    static loadScript(src: string, async: boolean = false, type: ScriptType = "text/javascript", parent?: Node, time: boolean | string = true) {
        return LoaderUtils.loadElement(src, parent, () => {
            const script = document.createElement("script");
            script.type = type;
            script.src = LoaderUtils.updateSrc(src, time);
            script.async = async;
            return script;
        });
    }

    static loadStyle(src: string, parent?: Node, time: boolean | string = true) {
        return LoaderUtils.loadElement(src, parent, () => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = LoaderUtils.updateSrc(src, time);
            return link;
        });
    }

    private static updateSrc(src: string, time: boolean | string) {
        if (src.startsWith("data:") || !time) {
            return src;
        }
        const url = new URL(src);
        url.searchParams.set("time", typeof time === "string" ? time : String(Date.now()));
        return url.toString();
    }

    private static loadElement<T extends ILoadableElement>(src: string, parent: Node, setup: () => T): Promise<T> {
        const promises = LoaderUtils.promises as ILoaderPromises<T>;
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
        elem = setup();
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
