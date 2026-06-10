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
    isFillerStart: boolean;
    isFillerEnd: boolean;
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
        return (this.disabledDates() || [])
            .map(d => parseValidDate(d))
            .filter((d): d is Date => d !== null)
            .map(d => toMidnight(d).getTime());
    });

    readonly isMultiSelect = computed(() => Array.isArray(this.value()));

    // Common Day Validator mapping strategy shared across computed environments
    private readonly isDayOfWeekDisabledFn = computed(() => {
        const disDays = this.disabledDays();
        return (jsDay: number) => disDays.some(d => (d === 7 ? 0 : d) === jsDay);
    });

    readonly validatedValue = computed(() => {
        const val = this.value();
        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const isDayOfWeekDisabled = this.isDayOfWeekDisabledFn();

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

    // --- Computed Navigation States ---
    readonly canGoPrev = computed(() => {
        const min = this.minDate();
        if (!min) return true;

        // Start checking from the month immediately preceding our current view context
        let testMonth = this.currentMonth() - 1;
        let testYear = this.currentYear();
        if (testMonth === -1) {
            testMonth = 11;
            testYear--;
        }

        const minMidnight = toMidnight(min);
        // Quick exit if the target month falls completely out of bounding limits
        const lastDayOfTestMonth = new Date(testYear, testMonth + 1, 0);
        if (lastDayOfTestMonth < minMidnight) return false;

        // Perform a deeper scan backwards to see if any valid slot remains reachable
        while (lastDayOfTestMonth >= minMidnight) {
            if (this.isMonthAvailable(testYear, testMonth)) {
                return true;
            }
            testMonth--;
            if (testMonth === -1) {
                testMonth = 11;
                testYear--;
            }
            lastDayOfTestMonth.setFullYear(testYear, testMonth + 1, 0);
        }
        return false;
    });

    readonly canGoNext = computed(() => {
        const max = this.maxDate();
        if (!max) return true;

        let testMonth = this.currentMonth() + 1;
        let testYear = this.currentYear();
        if (testMonth === 12) {
            testMonth = 0;
            testYear++;
        }

        const maxMidnight = toMidnight(max);
        const firstDayOfTestMonth = new Date(testYear, testMonth, 1);
        if (firstDayOfTestMonth > maxMidnight) return false;

        while (firstDayOfTestMonth <= maxMidnight) {
            if (this.isMonthAvailable(testYear, testMonth)) {
                return true;
            }
            testMonth++;
            if (testMonth === 12) {
                testMonth = 0;
                testYear++;
            }
            firstDayOfTestMonth.setFullYear(testYear, testMonth, 1);
        }
        return false;
    });

    readonly calendarCells = computed<CalendarCell[]>(() => {
        const year = this.currentYear();
        const month = this.currentMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        let startOffset = firstDayOfMonth.getDay() - 1;
        if (startOffset === -1) startOffset = 6;
        if (startOffset === 0) startOffset = 7;

        const gridStartDate = new Date(year, month, 1 - startOffset);
        const rawCells: CalendarCell[] = [];

        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const isDayOfWeekDisabled = this.isDayOfWeekDisabledFn();

        const currentValue = this.validatedValue();
        const startDrag = this.dragStartCellDate();
        const currentDrag = this.dragCurrentCellDate();
        const dragging = this.isDragging();
        const dragSnapshot = this.initialSelectedStateBeforeDrag();
        const targetState = this.dragTargetState();
        const multiSelectMode = this.isMultiSelect();

        let dragMinT = Infinity;
        let dragMaxT = -Infinity;
        const currentDragT = currentDrag ? toMidnight(currentDrag).getTime() : null;

        if (multiSelectMode && dragging && startDrag && currentDrag) {
            const startT = toMidnight(startDrag).getTime();
            const endT = toMidnight(currentDrag).getTime();
            dragMinT = Math.min(startT, endT);
            dragMaxT = Math.max(startT, endT);
        }

        const prevMonthLastDayT = toMidnight(new Date(year, month, 0)).getTime();
        const nextMonthFirstDayT = toMidnight(new Date(year, month + 1, 1)).getTime();

        for (let row = 0; row < 6; row++) {
            const firstDateOfRow = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + (row * 7));

            rawCells.push({
                id: `week-${row}-${firstDateOfRow.getTime()}`,
                date: null, isCurrentMonth: false, isDisabled: true, isSelected: false, isInDragRange: false,
                isWeekNum: true, weekNumber: getISOWeekNumber(firstDateOfRow), isRangeStart: false, isRangeEnd: false,
                isFillerStart: false, isFillerEnd: false
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

                if (dragging) {
                    if (multiSelectMode && startDrag && currentDrag) {
                        if (timestamp >= dragMinT && timestamp <= dragMaxT) {
                            isInDragRange = true;
                            if (!isDisabled) isSelected = targetState;
                            if (timestamp === dragMinT) isRangeStart = true;
                            if (timestamp === dragMaxT) isRangeEnd = true;
                        } else {
                            isSelected = dragSnapshot.get(timestamp) || false;
                        }
                    }
                    else if (!multiSelectMode && currentDragT !== null && timestamp === currentDragT) {
                        isInDragRange = true;
                        if (!isDisabled) isSelected = true;
                        isRangeStart = true;
                        isRangeEnd = true;
                    }
                }

                rawCells.push({
                    id: String(timestamp), date: cellDate, isCurrentMonth: cellDate.getMonth() === month,
                    isDisabled, isSelected, isInDragRange, isWeekNum: false, weekNumber: null,
                    isRangeStart, isRangeEnd,
                    isFillerStart: timestamp === nextMonthFirstDayT,
                    isFillerEnd: timestamp === prevMonthLastDayT
                });
            }
        }

        return rawCells;
    });

    constructor() {
        effect(() => {
            const val = this.validatedValue();
            if (val && !this.isInitialized) {
                untracked(() => {
                    let referenceDate: Date | null = null;
                    if (Array.isArray(val) && val.length > 0) {
                        referenceDate = new Date(Math.max(...val.map(d => d.getTime())));
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

    // --- Dynamic Month Verification Engine ---
    private isMonthAvailable(year: number, month: number): boolean {
        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const isDayOfWeekDisabled = this.isDayOfWeekDisabledFn();

        const loopDate = new Date(year, month, 1);
        const minMidnight = min ? toMidnight(min).getTime() : -Infinity;
        const maxMidnight = max ? toMidnight(max).getTime() : Infinity;

        // March day-by-day through the target month to see if at least one day is selectable
        while (loopDate.getMonth() === month) {
            const currentMidnight = toMidnight(loopDate);
            const currentT = currentMidnight.getTime();

            if (currentT >= minMidnight && currentT <= maxMidnight) {
                if (!disabledTimes.includes(currentT) && !isDayOfWeekDisabled(currentMidnight.getDay())) {
                    return true; // Found a valid date slot
                }
            }
            loopDate.setDate(loopDate.getDate() + 1);
        }
        return false;
    }

    // --- Smart Navigation Control Blocks ---
    prevMonth(): void {
        if (!this.canGoPrev()) return;

        let targetMonth = this.currentMonth() - 1;
        let targetYear = this.currentYear();
        if (targetMonth === -1) {
            targetMonth = 11;
            targetYear--;
        }

        // Leapfrog loop to bypass entirely disabled months
        while (!this.isMonthAvailable(targetYear, targetMonth)) {
            targetMonth--;
            if (targetMonth === -1) {
                targetMonth = 11;
                targetYear--;
            }
        }

        this.currentMonth.set(targetMonth);
        this.currentYear.set(targetYear);
    }

    nextMonth(): void {
        if (!this.canGoNext()) return;

        let targetMonth = this.currentMonth() + 1;
        let targetYear = this.currentYear();
        if (targetMonth === 12) {
            targetMonth = 0;
            targetYear++;
        }

        // Leapfrog loop to bypass entirely disabled months
        while (!this.isMonthAvailable(targetYear, targetMonth)) {
            targetMonth++;
            if (targetMonth === 12) {
                targetMonth = 0;
                targetYear++;
            }
        }

        this.currentMonth.set(targetMonth);
        this.currentYear.set(targetYear);
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
            (this.validatedValue() as Date[] || []).forEach(d => {
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
                    const cellCells = this.calendarCells();
                    const hoveredCell = cellCells.find(c => c.date && isSameDay(c.date, currentDrag));
                    if (hoveredCell && !hoveredCell.isDisabled) {
                        this.value.set(currentDrag);
                        this.currentMonth.set(currentDrag.getMonth());
                        this.currentYear.set(currentDrag.getFullYear());
                    }
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
                        if (t < minT || t > maxT) updatedSelectionMap.set(t, d);
                    });

                    const min = this.minDate();
                    const max = this.maxDate();
                    const disabledTimes = this.disabledTimestamps();
                    const isDayOfWeekDisabled = this.isDayOfWeekDisabledFn();

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

    private findClosestValidDate(
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
