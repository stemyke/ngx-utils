import {utc, DurationInputArg1, DurationInputArg2} from "moment";

declare global {
    interface String {
        pad(width: number, chr?: string): string;
        has(...parts: string[]): boolean;
        lcFirst(): string;
        ucFirst(): string;
    }

    interface Number {
        pad(width: number, chr?: string): string;
    }

    interface Date {
        isHoliday(): boolean;
        isBusinessDay(): boolean;
        add(amount?: DurationInputArg1, unit?: DurationInputArg2): Date;
        businessAdd(amount?: number, unit?: DurationInputArg2): Date;
        businessSubtract (amount?: number, unit?: DurationInputArg2): Date;
    }

    interface Set<T> {
        equals(obj: any): boolean;
        addArray(items: Array<T>): void;
    }

    interface Array<T> {
        has(...values: T[]): boolean;
        any(cb: (item: T) => boolean): boolean;
        move(oldIndex: number, newIndex: number): T[];
    }
}

String.prototype.pad = function (width: number, chr: string = "0"): string {
    return this.length >= width ? this : new Array(width - this.length + 1).join(chr) + this;
};

String.prototype.has = function (...parts: string[]): boolean {
    for (let i = 0; i < parts.length; i++) {
        if (this.indexOf(parts[i]) >= 0) return true;
    }
    return false;
};

String.prototype.lcFirst = function (): string {
    return this.charAt(0).toLowerCase() + this.substring(1);
};

String.prototype.ucFirst = function (): string {
    return this.charAt(0).toUpperCase() + this.substring(1);
};

Number.prototype.pad = function (width: number, chr: string = "0"): string {
    const str = this.toString();
    return str.length >= width ? str : new Array(width - str.length + 1).join(chr) + str;
};

Date.prototype.isHoliday = function (): boolean {
    return utc(this).isoWeekday() > 5;
};

Date.prototype.isBusinessDay = function (): boolean {
    return utc(this).isoWeekday() < 6;
};

Date.prototype.add = function (amount?: DurationInputArg1, unit?: DurationInputArg2): Date {
    return utc(this).add(amount, unit).toDate();
};

Date.prototype.businessAdd = function (amount?: number, unit?: DurationInputArg2): Date {
    const signal = amount < 0 ? -1 : 1;
    let remaining = Math.abs(amount);
    let day = this;
    while (remaining) {
        day = day.add(signal, unit);
        if (day.isBusinessDay()) {
            remaining--;
        }
    }
    return day;
};

Date.prototype.businessSubtract = function (amount?: number, unit?: DurationInputArg2): Date {
    return this.businessAdd(-amount, unit);
};

Set.prototype.equals = function (obj: any): boolean {
    if (!(obj instanceof Set))
        return false;
    if (this.size != obj.size)
        return false;
    for (const item of this) {
        if (!obj.has(item)) return false;
    }
    return true;
};
Object.defineProperty(Set.prototype, "equals", {enumerable: false});

Set.prototype.addArray = function (items: any[]): void {
    items.forEach(i => this.add(i));
};
Object.defineProperty(Set.prototype, "addArray", {enumerable: false});

Array.prototype.has = function (...items: any[]): boolean {
    for (let i = 0; i < items.length; i++) {
        if (this.indexOf(items[i]) >= 0) return true;
    }
    return false;
};
Object.defineProperty(Array.prototype, "has", {enumerable: false});

Array.prototype.any = function (cb: (item: any) => boolean) {
    for (let i = 0; i < this.length; i++) {
        if (cb(this[i])) return true;
    }
    return false;
};

Object.defineProperty(Array.prototype, "any", {enumerable: false});

Array.prototype.move = function (oldIndex: number, newIndex: number): any[] {
    const length = this.length;
    while (oldIndex < 0) {
        oldIndex += length;
    }
    while (newIndex < 0) {
        newIndex += length;
    }
    if (newIndex >= length) {
        let k = newIndex - length + 1;
        while (k--) {
            this.push(undefined);
        }
    }
    this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
    return this;
};
Object.defineProperty(Array.prototype, "move", {enumerable: false});
