import { Component, computed, effect, input, model, signal, untracked, ViewEncapsulation, HostListener } from "@angular/core";
import { parseValidDate, toMidnight, isSameDay, getISOWeekNumber } from "../../utils/date.utils";

export interface CalendarCell {
    id: string;
    date: Date | null;
    isCurrentMonth: boolean;
    isDisabled: boolean;
    isSelected: boolean;
    isInDragRange: boolean;
    isWeekNum: boolean;
    weekNumber: number | null;
    isRangeStart: boolean;
    isRangeEnd: boolean;
}

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent {

    readonly months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    readonly daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    readonly value = model<Date | Date[] | null>(null);
    readonly min = input<string | Date | null>(null);
    readonly max = input<string | Date | null>(null);
    readonly disabledDates = input<(string | Date)[] | null>([]);
    readonly disabledDays = input<number[]>([]);

    readonly currentMonth = signal<number>(new Date().getMonth());
    readonly currentYear = signal<number>(new Date().getFullYear());

    private readonly isDragging = signal<boolean>(false);
    private readonly dragStartCellDate = signal<Date | null>(null);
    private readonly dragCurrentCellDate = signal<Date | null>(null);
    private readonly initialSelectedStateBeforeDrag = signal<Map<number, boolean>>(new Map());

    private readonly dragTargetState = signal<boolean>(true);
    private isInitialized = false;

    private readonly minDate = computed(() => parseValidDate(this.min()));
    private readonly maxDate = computed(() => parseValidDate(this.max()));

    private readonly disabledTimestamps = computed(() => {
        const inputs = this.disabledDates() || [];
        return inputs
            .map(d => parseValidDate(d))
            .filter((d): d is Date => d !== null)
            .map(d => toMidnight(d).getTime());
    });

    readonly isMultiSelect = computed(() => Array.isArray(this.value()));

    readonly validatedValue = computed(() => {
        const val = this.value();
        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const disDays = this.disabledDays();

        const isDayOfWeekDisabled = (jsDay: number) => {
            return disDays.some(d => {
                if (d === 0 || d === 7) return jsDay === 6;
                if (d === 1) return jsDay === 1;
                if (d === 2) return jsDay === 2;
                if (d === 3) return jsDay === 3;
                if (d === 4) return jsDay === 4;
                if (d === 5) return jsDay === 5;
                if (d === 6) return jsDay === 0;
                return false;
            });
        };

        const checkInvalid = (d: Date): boolean => {
            const midnight = toMidnight(d);
            if (min && midnight < toMidnight(min)) return true;
            if (max && midnight > toMidnight(max)) return true;
            if (disabledTimes.includes(midnight.getTime())) return true;
            if (isDayOfWeekDisabled(midnight.getDay())) return true;
            return false;
        };

        if (Array.isArray(val)) {
            return val.filter(d => d instanceof Date && !isNaN(d.getTime()) && !checkInvalid(d));
        } else if (val instanceof Date && !isNaN(val.getTime())) {
            if (checkInvalid(val)) {
                // Use the shared robust fallback finder routine
                return this.findClosestValidDate(val, min, max, disabledTimes, isDayOfWeekDisabled);
            }
            return val;
        }
        return null;
    });

    readonly calendarCells = computed<CalendarCell[]>(() => {
        const year = this.currentYear();
        const month = this.currentMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        let startOffset = firstDayOfMonth.getDay() - 1;
        if (startOffset === -1) startOffset = 6;
        if (startOffset === 0) startOffset = 7;

        const gridStartDate = new Date(year, month, 1 - startOffset);
        const cells: CalendarCell[] = [];
        const totalRows = 6;

        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const disDays = this.disabledDays();

        const isDayOfWeekDisabled = (jsDay: number) => {
            return disDays.some(d => {
                if (d === 0 || d === 7) return jsDay === 6;
                if (d === 1) return jsDay === 1;
                if (d === 2) return jsDay === 2;
                if (d === 3) return jsDay === 3;
                if (d === 4) return jsDay === 4;
                if (d === 5) return jsDay === 5;
                if (d === 6) return jsDay === 0;
                return false;
            });
        };

        const currentValue = this.validatedValue();
        const startDrag = this.dragStartCellDate();
        const currentDrag = this.dragCurrentCellDate();
        const dragging = this.isDragging();
        const dragSnapshot = this.initialSelectedStateBeforeDrag();
        const targetState = this.dragTargetState();
        const multiSelectMode = this.isMultiSelect();

        let dragMinT = Infinity;
        let dragMaxT = -Infinity;
        let currentDragT = currentDrag ? toMidnight(currentDrag).getTime() : null;

        if (multiSelectMode && dragging && startDrag && currentDrag) {
            const startT = toMidnight(startDrag).getTime();
            const endT = toMidnight(currentDrag).getTime();
            dragMinT = Math.min(startT, endT);
            dragMaxT = Math.max(startT, endT);
        }

        for (let row = 0; row < totalRows; row++) {
            const firstDateOfRow = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + (row * 7));

            cells.push({
                id: `week-${row}-${firstDateOfRow.getTime()}`,
                date: null, isCurrentMonth: false, isDisabled: true, isSelected: false, isInDragRange: false,
                isWeekNum: true, weekNumber: getISOWeekNumber(firstDateOfRow), isRangeStart: false, isRangeEnd: false
            });

            for (let col = 0; col < 7; col++) {
                const cellDate = new Date(firstDateOfRow.getFullYear(), firstDateOfRow.getMonth(), firstDateOfRow.getDate() + col);
                const cellMidnight = toMidnight(cellDate);
                const timestamp = cellMidnight.getTime();

                let isDisabled = false;
                if (min && cellMidnight < toMidnight(min)) isDisabled = true;
                if (max && cellMidnight > toMidnight(max)) isDisabled = true;
                if (disabledTimes.includes(timestamp)) isDisabled = true;
                if (isDayOfWeekDisabled(cellMidnight.getDay())) isDisabled = true;

                let isSelected = false;
                if (!multiSelectMode) {
                    isSelected = currentValue instanceof Date && isSameDay(currentValue, cellMidnight);
                } else if (Array.isArray(currentValue)) {
                    isSelected = currentValue.some(d => isSameDay(d, cellMidnight));
                }

                let isInDragRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;

                if (dragging && !isDisabled) {
                    if (multiSelectMode && startDrag && currentDrag) {
                        if (timestamp >= dragMinT && timestamp <= dragMaxT) {
                            isInDragRange = true;
                            isSelected = targetState;
                            if (timestamp === dragMinT) isRangeStart = true;
                            if (timestamp === dragMaxT) isRangeEnd = true;
                        } else {
                            isSelected = dragSnapshot.get(timestamp) || false;
                        }
                    }
                    else if (!multiSelectMode && currentDragT !== null) {
                        if (timestamp === currentDragT) {
                            isInDragRange = true;
                            isSelected = true;
                            isRangeStart = true;
                            isRangeEnd = true;
                        } else {
                            isSelected = false;
                        }
                    }
                }

                cells.push({
                    id: String(timestamp), date: cellDate, isCurrentMonth: cellDate.getMonth() === month,
                    isDisabled, isSelected, isInDragRange, isWeekNum: false, weekNumber: null, isRangeStart, isRangeEnd
                });
            }
        }

        return cells;
    });

    constructor() {
        effect(() => {
            const val = this.validatedValue();
            if (val && !this.isInitialized) {
                untracked(() => {
                    let referenceDate: Date | null = null;
                    if (Array.isArray(val) && val.length > 0) {
                        const maxTimestamp = Math.max(...val.map(d => d.getTime()));
                        referenceDate = new Date(maxTimestamp);
                    } else if (val instanceof Date) {
                        referenceDate = val;
                    }

                    if (referenceDate && !isNaN(referenceDate.getTime())) {
                        this.currentMonth.set(referenceDate.getMonth());
                        this.currentYear.set(referenceDate.getFullYear());
                        this.isInitialized = true;
                    }
                });
            }
        });
    }

    onMouseDown(cell: CalendarCell, event: MouseEvent): void {
        if (cell.isWeekNum || cell.isDisabled || !cell.date) return;

        this.dragStartCellDate.set(cell.date);
        this.dragCurrentCellDate.set(cell.date);
        this.isDragging.set(true);

        const snapshotMap = new Map<number, boolean>();

        if (!this.isMultiSelect()) {
            this.dragTargetState.set(true);
        } else {
            this.dragTargetState.set(!cell.isSelected);
            const currentDates = this.validatedValue() as Date[] || [];
            currentDates.forEach(d => {
                snapshotMap.set(toMidnight(d).getTime(), true);
            });
        }

        this.initialSelectedStateBeforeDrag.set(snapshotMap);
    }

    onMouseEnter(cell: CalendarCell): void {
        if (!this.isDragging() || cell.isWeekNum) return;
        this.dragCurrentCellDate.set(cell.date);
    }

    onGridMouseLeave(): void { }

    @HostListener("window:mouseup", ["$event"])
    onMouseUpGlobal(): void {
        if (!this.isDragging()) return;

        untracked(() => {
            const startDrag = this.dragStartCellDate();
            const currentDrag = this.dragCurrentCellDate();

            if (startDrag && currentDrag) {
                if (!this.isMultiSelect()) {
                    this.value.set(currentDrag);
                    this.currentMonth.set(currentDrag.getMonth());
                    this.currentYear.set(currentDrag.getFullYear());
                }
                else {
                    const targetState = this.dragTargetState();
                    const startT = toMidnight(startDrag).getTime();
                    const endT = toMidnight(currentDrag).getTime();
                    const minT = Math.min(startT, endT);
                    const maxT = Math.max(startT, endT);

                    const previousSelection = this.validatedValue() as Date[] || [];
                    const updatedSelectionMap = new Map<number, Date>();

                    previousSelection.forEach(d => {
                        const t = toMidnight(d).getTime();
                        if (t < minT || t > maxT) {
                            updatedSelectionMap.set(t, d);
                        }
                    });

                    const min = this.minDate();
                    const max = this.maxDate();
                    const disabledTimes = this.disabledTimestamps();
                    const disDays = this.disabledDays();

                    const isDayOfWeekDisabled = (jsDay: number) => {
                        return disDays.some(d => {
                            if (d === 0 || d === 7) return jsDay === 6;
                            if (d === 1) return jsDay === 1;
                            if (d === 2) return jsDay === 2;
                            if (d === 3) return jsDay === 3;
                            if (d === 4) return jsDay === 4;
                            if (d === 5) return jsDay === 5;
                            if (d === 6) return jsDay === 0;
                            return false;
                        });
                    };

                    const dynamicDateCursor = new Date(minT);
                    const loopEndMidnight = new Date(maxT);

                    while (dynamicDateCursor <= loopEndMidnight) {
                        const currentT = dynamicDateCursor.getTime();
                        let isDayRestricted = false;
                        if (min && dynamicDateCursor < toMidnight(min)) isDayRestricted = true;
                        if (max && dynamicDateCursor > toMidnight(max)) isDayRestricted = true;
                        if (disabledTimes.includes(currentT)) isDayRestricted = true;
                        if (isDayOfWeekDisabled(dynamicDateCursor.getDay())) isDayRestricted = true;

                        if (!isDayRestricted) {
                            if (targetState) {
                                updatedSelectionMap.set(currentT, new Date(currentT));
                            } else {
                                updatedSelectionMap.delete(currentT);
                            }
                        }
                        dynamicDateCursor.setDate(dynamicDateCursor.getDate() + 1);
                    }

                    this.value.set(Array.from(updatedSelectionMap.values()));
                    this.currentMonth.set(currentDrag.getMonth());
                    this.currentYear.set(currentDrag.getFullYear());
                }
            }
        });

        this.isDragging.set(false);
        this.dragStartCellDate.set(null);
        this.dragCurrentCellDate.set(null);
        this.initialSelectedStateBeforeDrag.set(new Map());
    }

    prevMonth(): void {
        if (this.currentMonth() === 0) {
            this.currentMonth.set(11);
            this.currentYear.update(y => y - 1);
        } else {
            this.currentMonth.update(m => m - 1);
        }
    }

    nextMonth(): void {
        if (this.currentMonth() === 11) {
            this.currentMonth.set(0);
            this.currentYear.update(y => y + 1);
        } else {
            this.currentMonth.update(m => m + 1);
        }
    }

    // --- Core Dynamic Fallback Resolution Finder ---
    private findClosestValidDate(
        baseDate: Date,
        min: Date | null,
        max: Date | null,
        disabledTimes: number[],
        isDayOfWeekDisabled: (jsDay: number) => boolean
    ): Date {
        const midnightBase = toMidnight(baseDate);

        // Determine the direction to step based on the boundary violation
        let direction = 1; // March forward by default
        let testDate = new Date(midnightBase.getTime());

        if (min && midnightBase < toMidnight(min)) {
            testDate = new Date(toMidnight(min).getTime());
            direction = 1;
        } else if (max && midnightBase > toMidnight(max)) {
            testDate = new Date(toMidnight(max).getTime());
            direction = -1;
        }

        const maxIterations = 365; // High loop ceiling guard
        let iterations = 0;

        while (iterations < maxIterations) {
            const currentT = testDate.getTime();

            let isInvalid = false;
            if (min && testDate < toMidnight(min)) isInvalid = true;
            if (max && testDate > toMidnight(max)) isInvalid = true;
            if (disabledTimes.includes(currentT)) isInvalid = true;
            if (isDayOfWeekDisabled(testDate.getDay())) isInvalid = true;

            if (!isInvalid) {
                return testDate; // Found a working day!
            }

            // Step forward or backward by one day
            testDate.setDate(testDate.getDate() + direction);
            iterations++;
        }

        return min ? min : (max ? max : new Date()); // Ultimate safe fallback
    }
}
