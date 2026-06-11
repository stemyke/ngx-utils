import {Component, computed, input, model} from "@angular/core";
import {parseValidDate, toMidnight, findClosestValidDate, isDayOfWeekDisabled} from "../../utils/date.utils";

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

    readonly validatedValue = computed(() => {
        const val = this.value();
        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const disabledDays = this.disabledDays();

        const checkInvalid = (d: Date): boolean => {
            const midnight = toMidnight(d);
            if (min && midnight < toMidnight(min)) return true;
            if (max && midnight > toMidnight(max)) return true;
            if (disabledTimes.includes(midnight.getTime())) return true;
            return isDayOfWeekDisabled(midnight, disabledDays);
        };

        if (Array.isArray(val)) {
            return val.filter(d => d instanceof Date && !isNaN(d.getTime()) && !checkInvalid(d));
        } else if (val instanceof Date && !isNaN(val.getTime())) {
            if (checkInvalid(val)) {
                return findClosestValidDate(val, min, max, disabledTimes, disabledDays);
            }
            return val;
        }
        return null;
    });
}
