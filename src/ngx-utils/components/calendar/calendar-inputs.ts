import {Component, computed, effect, input, model} from "@angular/core";
import {parseValidDate, toMidnight, findClosestValidDate, isDayOfWeekDisabled, isSameDay} from "../../utils/date.utils";
import {isString} from "../../utils/object.utils";

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
    readonly strict = input(true);
    readonly testId = input("calendar", {
        transform: value => String(value || "calendar")
    });

    protected readonly minDate = computed(() => parseValidDate(this.min()));
    protected readonly maxDate = computed(() => parseValidDate(this.max()));

    protected readonly disabledTimestamps = computed(() => {
        return (this.disabledDates() || [])
            .map(d => parseValidDate(d))
            .filter((d): d is Date => d !== null)
            .map(d => toMidnight(d).getTime());
    });

    protected readonly parsedValue = computed(() => {
        const value = this.value();
        return isString(value) ? parseValidDate(value) : value;
    });

    protected readonly validatedValue = computed(() => {
        const value = this.parsedValue();
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

        if (Array.isArray(value)) {
            const filtered = value.filter(d => d instanceof Date && !isNaN(d.getTime()) && !checkInvalid(d));
            return (value.length !== filtered.length) ? filtered : value;
        } else if (value instanceof Date && !isNaN(value.getTime())) {
            if (checkInvalid(value)) {
                return findClosestValidDate(value, min, max, disabledTimes, disabledDays);
            }
            return value;
        }
        return null;
    });

    constructor() {
        effect(() => {
            const strict = this.strict();
            const value = this.value();
            const parsed = this.parsedValue();
            const valid = this.validatedValue();
            // Force select a valid value based on preferences
            if (valid !== parsed || (strict && valid !== value)) {
                this.value.set(valid);
            }
        });
    }

    clear(): void {
        this.value.set(null);
    }
}
