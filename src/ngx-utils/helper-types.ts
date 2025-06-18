export type MaybePromise<T> = T | PromiseLike<T>;

export type MaybeArray<T> = T | T[];

export type StringKeys<Context extends {[key: string]: any}> = Extract<keyof Context, string>;

export type CapitalizeFirst<S extends string> = S extends `${infer F}${infer R}`
    ? `${Uppercase<F>}${R}`
    : S;

export type CamelJoin<Prefix extends string, Key extends string> =
    `${Prefix}${CapitalizeFirst<Key>}`;

export type PrefixedPick<
    T extends object,
    Prefix extends string,
    K extends keyof T & string
> = {
    [P in keyof T as P extends K ? CamelJoin<Prefix, P> : never]: T[P];
};
