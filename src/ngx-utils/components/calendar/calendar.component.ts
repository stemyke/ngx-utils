import {Component, computed, effect, HostListener, signal, untracked, ViewEncapsulation} from "@angular/core";
import {
    findClosestValidDate,
    getISOWeekNumber,
    isDayOfWeekDisabled,
    isSameDay,
    parseValidDate,
    toMidnight
} from "../../utils/date.utils";
import {CalendarInputs} from "./calendar-inputs";

export interface CalendarCell {
    id: string;
    date: Date | null;
    isCurrentMonth: boolean;
    isDisabled: boolean;
    isSelected: boolean;
    isInDragRange: boolean;
    numValue: number;
    isWeekNum: boolean;
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
export class CalendarComponent extends CalendarInputs {

    readonly months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    readonly daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    readonly currentMonth = signal<number>(new Date().getMonth());
    readonly currentYear = signal<number>(new Date().getFullYear());

    protected readonly isDragging = signal<boolean>(false);
    protected readonly dragStartCellDate = signal<Date | null>(null);
    protected readonly dragCurrentCellDate = signal<Date | null>(null);
    protected readonly initialSelectedStateBeforeDrag = signal<Map<number, boolean>>(new Map());
    protected readonly dragTargetState = signal<boolean>(true);
    protected isInitialized = false;

    readonly isMultiSelect = computed(() => Array.isArray(this.value()));

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
        const disabledDays = this.disabledDays();

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
            const weekNum = getISOWeekNumber(firstDateOfRow);
            rawCells.push({
                id: `week-${row}-${weekNum}`,
                date: null, isCurrentMonth: false, isDisabled: true, isSelected: false, isInDragRange: false,
                isWeekNum: true, numValue: getISOWeekNumber(firstDateOfRow), isRangeStart: false, isRangeEnd: false,
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
                if (isDayOfWeekDisabled(cellMidnight, disabledDays)) isDisabled = true;

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
                    } else if (!multiSelectMode && currentDragT !== null && timestamp === currentDragT) {
                        isInDragRange = true;
                        if (!isDisabled) isSelected = true;
                        isRangeStart = true;
                        isRangeEnd = true;
                    }
                }

                rawCells.push({
                    id: String(timestamp),
                    date: cellDate,
                    isCurrentMonth: cellDate.getMonth() === month,
                    isDisabled,
                    isSelected,
                    isInDragRange,
                    isWeekNum: false,
                    numValue: cellDate.getDate(),
                    isRangeStart,
                    isRangeEnd,
                    isFillerStart: timestamp === nextMonthFirstDayT,
                    isFillerEnd: timestamp === prevMonthLastDayT
                });
            }
        }

        return rawCells;
    });

    constructor() {
        super();
        effect(() => {
            const val = this.validatedValue();
            if (val && !this.isInitialized) {
                untracked(() => {
                    let referenceDate: Date | null = null;

                    // 1. If a valid selection exists, use the latest date as the reference view anchor
                    if (Array.isArray(val) && val.length > 0) {
                        referenceDate = new Date(Math.max(...val.map(d => d.getTime())));
                    } else if (val instanceof Date) {
                        referenceDate = val;
                    }

                    // 2. FALLBACK: If no selection exists, dynamically look up the first allowed calendar date
                    if (!referenceDate || isNaN(referenceDate.getTime())) {
                        const min = this.minDate();
                        const max = this.maxDate();
                        const disabledTimes = this.disabledTimestamps();
                        const disabledDays = this.disabledDays();

                        // Start searching from today
                        referenceDate = findClosestValidDate(new Date(), min, max, disabledTimes, disabledDays);
                    }

                    // 3. Update the view tracking states cleanly
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
        const disabledDays = this.disabledDays();

        const loopDate = new Date(year, month, 1);
        const minMidnight = min ? toMidnight(min).getTime() : -Infinity;
        const maxMidnight = max ? toMidnight(max).getTime() : Infinity;

        // March day-by-day through the target month to see if at least one day is selectable
        while (loopDate.getMonth() === month) {
            const currentMidnight = toMidnight(loopDate);
            const currentT = currentMidnight.getTime();

            if (currentT >= minMidnight && currentT <= maxMidnight) {
                if (!disabledTimes.includes(currentT) && !isDayOfWeekDisabled(currentMidnight, disabledDays)) {
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

    onGridMouseLeave(): void {
    }

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
                } else {
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
                    const disabledDays = this.disabledDays();

                    const dynamicDateCursor = new Date(minT);
                    const loopEndMidnight = new Date(maxT);

                    while (dynamicDateCursor <= loopEndMidnight) {
                        const currentT = dynamicDateCursor.getTime();
                        let isDayRestricted = false;
                        if (min && dynamicDateCursor < toMidnight(min)) isDayRestricted = true;
                        if (max && dynamicDateCursor > toMidnight(max)) isDayRestricted = true;
                        if (disabledTimes.includes(currentT)) isDayRestricted = true;
                        if (isDayOfWeekDisabled(dynamicDateCursor, disabledDays)) isDayRestricted = true;

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
}
