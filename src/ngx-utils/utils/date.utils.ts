import {DurationInputArg1, DurationInputArg2} from "moment";
import * as moment from "moment";

export class DateUtils {

    static isHoliday(date: Date): boolean {
        return moment(date).isoWeekday() > 5;
    }

    static isBusinessDay(date: Date): boolean {
        return moment(date).isoWeekday() < 6;
    }

    static add(date: Date, amount?: DurationInputArg1, unit?: DurationInputArg2): Date {
        return moment(date).add(amount, unit).toDate();
    }

    static businessAdd(date: Date, amount: number, unit?: DurationInputArg2): Date {
        const signal = amount < 0 ? -1 : 1;
        let remaining = Math.abs(amount);
        let day = date;
        while (remaining) {
            day = DateUtils.add(day, signal, unit);
            if (DateUtils.isBusinessDay(day)) {
                remaining--;
            }
        }
        return day;
    }

    static businessSubtract(date: Date, amount: number, unit?: DurationInputArg2): Date {
        return DateUtils.businessAdd(date, -amount, unit);
    }
}
