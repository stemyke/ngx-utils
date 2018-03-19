export class StringUtils {

    static concat(separator: string, ...strings: string[]): string {
        return strings.filter(s => !!s).join(separator);
    }
}
