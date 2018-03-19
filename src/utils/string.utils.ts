export class StringUtils {

    static concat(separator: string, ...strings: string[]): string {
        return strings.filter(
            // @dynamic
            str => !!str
        ).join(separator);
    }
}
