export class StringUtils {

    static concat(separator: string, ...strings: string[]): string {
        return strings.filter(
            // @dynamic
            str => !!str
        ).join(separator);
    }

    static startsWith(str: string, ...starts: string[]): boolean {
        if (typeof str !== "string") return false;
        for (let i = 0; i < starts.length; i++) {
            if (str.startsWith(starts[i])) return true;
        }
        return false;
    }

    static has(str: string, ...parts: string[]): boolean {
        if (typeof str !== "string") return false;
        for (let i = 0; i < parts.length; i++) {
            if (str.indexOf(parts[i]) >= 0) return true;
        }
        return false;
    }

    static lcFirst(str: string): string {
        return typeof str === "string" ? str.charAt(0).toLowerCase() + str.substring(1) : "";
    }

    static ucFirst(str: string): string {
        return typeof str === "string" ? str.charAt(0).toUpperCase() + str.substring(1) : "";
    }

    static camelize(str: string): string {
        return StringUtils.ucFirst(str)
            .replace(/[-.]([a-z])/g, g => g[1].toUpperCase());
    }

    static isObjectId(id: string): boolean {
        return typeof id === "string" && id.length == 24 && !isNaN(Number("0x" + id));
    }

    static parseDomain(baseUrl: string): string {
        try {
            const url = new URL(String(baseUrl || ""));
            const port = url.port && url.port !== "443" && url.port !== "80" ? `:${url.port}` : ``;
            return `${url.protocol}//${url.hostname}${port}/`;
        } catch {
            return "/";
        }
    }
}
