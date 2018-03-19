interface IScriptPromises {
    [src: string]: Promise<HTMLScriptElement>;
}

export class LoaderUtils {

    static scriptPromises: IScriptPromises = {};
    static styles: Set<string> = new Set<string>();

    static loadScript(src: string, async: boolean = false): Promise<HTMLScriptElement> {
        this.scriptPromises[src] = this.scriptPromises[src] || new Promise<any>((resolve, reject) => {
            // Load script
            const script: any = document.createElement("script");
            script.type = "text/javascript";
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

    static loadStyle(src: string): void {
        if (this.styles.has(src)) return;
        this.styles.add(src);
        const link: HTMLLinkElement = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = src;
        document.body.appendChild(link);
    }
}
