import {DateTime} from "luxon";
import {DurationUnit} from "../common-types";

export class DateUtils {

    static isHoliday(date: Date): boolean {
        return DateTime.fromJSDate(date).isWeekend;
    }

    static isBusinessDay(date: Date): boolean {
        return !DateUtils.isHoliday(date);
    }

    static add(date: Date, amount: number = 1, unit: DurationUnit = "days"): Date {
        return DateTime.fromJSDate(date).plus({[unit]: amount}).toJSDate();
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
