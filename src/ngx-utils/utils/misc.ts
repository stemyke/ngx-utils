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
