import {ObjectType} from "../common-types";

export interface Matcher {
    [Symbol.match](string: string): RegExpMatchArray | null;
}

@ObjectType("enum")
export class Enum {

    readonly value: string;

    get length(): number {
        return this.value?.length ?? 0;
    }

    constructor(value: any) {
        this.value = String(value ?? "");
    }

    toString(): string {
        return this.value;
    }

    includes(val: string, position?: number): boolean {
        return this.value.includes(val, position);
    }

    indexOf(val: string, position?: number): number {
        return this.value.indexOf(val, position);
    }

    match(matcher: string | RegExp | Matcher): RegExpMatchArray | null {
        return this.value.match(matcher as any);
    }

    toLowerCase(): Enum {
        return new Enum(this.value.toLowerCase());
    }

    toUpperCase(): Enum {
        return new Enum(this.value.toUpperCase());
    }
}
