export type MaybePromise<T> = T | PromiseLike<T>;

export type MaybeArray<T> = T | T[];

export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T];

export type StringKeys<T> = KeysOfType<T, string>;

export type ObjOfType<T, U> = Extract<T, KeysOfType<T, U>>;

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
