export class StringUtils {

    static concat(separator: string, ...strings: string[]): string {
        return strings.filter(
            // @dynamic
            str => !!str
        ).join(separator);
    }

    static startsWith(str: string, ...starts: string[]): boolean {
        for (let i = 0; i < starts.length; i++) {
            if (str.startsWith(starts[i])) return true;
        }
        return false;
    }

    static has(str: string, ...parts: string[]): boolean {
        for (let i = 0; i < parts.length; i++) {
            if (str.indexOf(parts[i]) >= 0) return true;
        }
        return false;
    }

    static lcFirst(str: string): string {
        return str ? str.charAt(0).toLowerCase() + str.substring(1) : "";
    }

    static ucFirst(str: string): string {
        return str ? str.charAt(0).toUpperCase() + str.substring(1) : "";
    }

    static isObjectId(id: string): boolean {
        return typeof id === "string" && id.length == 24 && !isNaN(Number("0x" + id));
    }

    static parseDomain(baseUrl: string): string {
        try {
            const url = new URL(baseUrl);
            const port = url.port && url.port !== "443" && url.port !== "80" ? `:${url.port}` : ``;
            return `${url.protocol}//${url.hostname}${port}/`;
        } catch {
            return "/";
        }
    }
}

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function hashCode(str: string) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
