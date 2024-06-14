import {ScriptType, IScriptPromises, IStylePromises} from "../common-types";

export class LoaderUtils {

    static scriptPromises: IScriptPromises = {};
    static stylePromises: IStylePromises = {};

    static loadScript(src: string, async: boolean = false, type: ScriptType = "text/javascript"): Promise<HTMLScriptElement> {
        this.scriptPromises[src] = this.scriptPromises[src] || new Promise<any>((resolve, reject) => {
            // Load script
            const script: any = document.createElement("script");
            script.type = type;
            script.src = src;
            script.async = async;
            if (script.readyState) {
                // Internet explorer
                script.onreadystatechange = () => {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        resolve(script);
                    }
                };
            } else {
                // Other browsers
                script.onload = () => resolve(script);
            }
            script.onerror = (error: any) => reject(error);
            document.body.appendChild(script);
        });
        return this.scriptPromises[src];
    }

    static loadStyle(src: string): Promise<HTMLLinkElement> {
        this.stylePromises[src] = this.stylePromises[src] || new Promise<any>((resolve, reject) => {
            // Load script
            const link: any = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = src;

            if (link.readyState) {
                // Internet explorer
                link.onreadystatechange = () => {
                    if (link.readyState === "loaded" || link.readyState === "complete") {
                        link.onreadystatechange = null;
                        resolve(link);
                    }
                };
            } else {
                // Other browsers
                link.onload = () => resolve(link);
            }
            link.onerror = (error: any) => reject(error);
            document.body.appendChild(link);
        });
        return this.stylePromises[src];
    }
}
