import {DateTime} from "luxon";
import {DurationUnit} from "../common-types";

/**
 * Helper function that parses ISO string or Date object to a real Date object if its possible
 * @param value
 */
export function parseValidDate(value: string | Date | null): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Function that converts the provided date to midnight
 * @param value
 */
export function toMidnight(value: Date): Date {
    value = value instanceof Date ? value : new Date();
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0);
}

/**
 * Compares two dates if they are on the same day
 * @param a
 * @param b
 */
export function isSameDay(a: Date, b: Date): boolean {
    return toMidnight(a).getTime() === toMidnight(b).getTime();
}

/**
 * Adds an amount of units to the specified date
 * @param date
 * @param amount
 * @param unit
 */
export function addDate(date: Date, amount: number = 1, unit: DurationUnit = "days"): Date {
    return DateTime.fromJSDate(date).plus({[unit]: amount}).toJSDate();
}

export class DateUtils {

    static isHoliday(date: Date): boolean {
        return DateTime.fromJSDate(date).isWeekend;
    }

    static isBusinessDay(date: Date): boolean {
        return !DateUtils.isHoliday(date);
    }

    static add(date: Date, amount: number = 1, unit: DurationUnit = "days"): Date {
        return addDate(date, amount, unit);
    }

    static businessAdd(date: Date, amount: number = 1, unit: DurationUnit = "days", freeDays: Date[] = []): Date {
        const signal = amount < 0 ? -1 : 1;
        const freeTimes = freeDays.map(d => DateTime.fromJSDate(d));
        let remaining = Math.abs(amount);
        let day = DateTime.fromJSDate(date);
        while (remaining) {
            day = day.plus({[unit]: signal});
            if (day.isWeekend && !freeTimes.some(m => m.hasSame(day, "day"))) {
                remaining--;
            }
        }
        return day.toJSDate();
    }

    static businessSubtract(date: Date, amount: number = 1, unit: DurationUnit = "days"): Date {
        return DateUtils.businessAdd(date, -amount, unit);
    }
}
