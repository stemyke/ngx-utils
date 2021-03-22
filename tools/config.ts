export function isPrimitive(value: any): boolean {
    const type = typeof value;
    return value == null || (type !== "object" && type !== "function");
}

export function isDate(value: any): value is Date {
    return null !== value && !isNaN(value) && "undefined" !== typeof value.getDate;
}

export interface IEnvironmentAlternatives {
    [name: string]: string[]
}

function convertValue(value: any, type: string): any {
    switch (type) {
        case "boolean":
            value = typeof value == "string" ? value.toLowerCase() : value;
            return (value == "no" || value == "false" || value == "0") ? false : !!value;
        case "number":
            const val = parseFloat(value);
            return isNaN(val) ? 0 : val;
    }
    return value;
}

function getFromEnv(path: string, alternatives: IEnvironmentAlternatives, value: any): any {
    const name = path.replace(/\.?([A-Z|0-9]+)/g, function (x,y){
        return "_" + y.toLowerCase()
    }).replace(/\./gi, "_").replace(/^_/, "").toUpperCase();
    const alts = Array.from(alternatives[name] || []);
    alts.unshift(name);
    for (const envName of alts) {
        const envValue = process.env[envName];
        if (typeof envValue !== "undefined") {
            const val = convertValue(envValue, typeof value);
            console.log(name, envName, val);
            return convertValue(envValue, typeof value);
        }
    }
    console.log(name, value);
    return value;
}

function createConfigRecursive(target: any, source: any, path: string, alternatives: IEnvironmentAlternatives): any {
    if (isPrimitive(source) || isDate(source)) {
        return getFromEnv(path, alternatives, source);
    }
    if (Array.isArray(source)) {
        target = Array.isArray(target) ? Array.from(target) : [];
        source.forEach((item, index) => {
            if (target.length > index)
                target[index] = createConfigRecursive(target[index], item, !path ? `${index}` : `${path}.${index}`, alternatives);
            else
                target.push(createConfigRecursive(null, item, !path ? `${index}` : `${path}.${index}`, alternatives));
        });
        return target;
    }
    return Object.keys(source).reduce((result, key) => {
        result[key] = createConfigRecursive(result[key], source[key], !path ? `${key}` : `${path}.${key}`, alternatives);
        return result;
    }, Object.assign({}, target));
}

export function parseConfig(config: any): any {
    if (typeof config == "string") {
        try {
            config = JSON.parse(config);
        } catch (e) {
            return {};
        }
    }
    return config;
}

export function createConfig(config: any, alternatives?: IEnvironmentAlternatives): any {
    alternatives = alternatives || {};
    console.log("Parsing config...");
    return createConfigRecursive(null, parseConfig(config), "", alternatives);
}

export default createConfig;
