import {Component, computed, input, model} from "@angular/core";
import {parseValidDate, toMidnight} from "../../utils/date.utils";

@Component({
    template: ``
})
export class CalendarInputs {

    readonly value = model<Date | Date[] | string | null>(null);
    readonly min = input<string | Date | null>(null);
    readonly max = input<string | Date | null>(null);
    readonly disabledDates = input<(string | Date)[] | null>([]);
    readonly disabledDays = input<number[]>([]);
    readonly disabled = model(false);

    protected readonly minDate = computed(() => parseValidDate(this.min()));
    protected readonly maxDate = computed(() => parseValidDate(this.max()));

    protected readonly disabledTimestamps = computed(() => {
        return (this.disabledDates() || [])
            .map(d => parseValidDate(d))
            .filter((d): d is Date => d !== null)
            .map(d => toMidnight(d).getTime());
    });

    protected readonly isDayOfWeekDisabled = computed(() => {
        const disDays = this.disabledDays();
        return (jsDay: number) => disDays.some(d => (d === 7 ? 0 : d) === jsDay);
    });

    readonly validatedValue = computed(() => {
        const val = this.value();
        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const isDayOfWeekDisabled = this.isDayOfWeekDisabled();

        const checkInvalid = (d: Date): boolean => {
            const midnight = toMidnight(d);
            if (min && midnight < toMidnight(min)) return true;
            if (max && midnight > toMidnight(max)) return true;
            if (disabledTimes.includes(midnight.getTime())) return true;
            return isDayOfWeekDisabled(midnight.getDay());
        };

        if (Array.isArray(val)) {
            return val.filter(d => d instanceof Date && !isNaN(d.getTime()) && !checkInvalid(d));
        } else if (val instanceof Date && !isNaN(val.getTime())) {
            if (checkInvalid(val)) {
                return this.findClosestValidDate(val, min, max, disabledTimes, isDayOfWeekDisabled);
            }
            return val;
        }
        return null;
    });

    protected findClosestValidDate(
        baseDate: Date,
        min: Date | null,
        max: Date | null,
        disabledTimes: number[],
        isDayOfWeekDisabled = (jsDay: number) => false
    ): Date {
        const midnightBase = toMidnight(baseDate);
        let direction = 1;
        let testDate = new Date(midnightBase.getTime());

        if (min && midnightBase < toMidnight(min)) {
            testDate = new Date(toMidnight(min).getTime());
            direction = 1;
        } else if (max && midnightBase > toMidnight(max)) {
            testDate = new Date(toMidnight(max).getTime());
            direction = -1;
        }

        let iterations = 0;
        while (iterations < 365) {
            const currentT = testDate.getTime();
            let isInvalid = false;
            if (min && testDate < toMidnight(min)) isInvalid = true;
            if (max && testDate > toMidnight(max)) isInvalid = true;
            if (disabledTimes.includes(currentT)) isInvalid = true;
            if (isDayOfWeekDisabled(testDate.getDay())) isInvalid = true;

            if (!isInvalid) return testDate;
            testDate.setDate(testDate.getDate() + direction);
            iterations++;
        }
        return min ? min : (max ? max : new Date());
    }
}
