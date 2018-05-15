export class StringUtils {

    static concat(separator: string, ...strings: string[]): string {
        return strings.filter(
            // @dynamic
            str => !!str
        ).join(separator);
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

    static startsWith(str: string, start: string): boolean {
        return str == start || (str && str.indexOf(start) == 0);
    }
}
