export type MaybePromise<T> = T | PromiseLike<T>;

export type MaybeArray<T> = T | T[];

export type StringKeys<Context extends {[key: string]: any}> = Extract<keyof Context, string>;
