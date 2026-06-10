import {Component, computed, effect, HostListener, input, model, signal, ViewEncapsulation} from "@angular/core";
import { parseValidDate, toMidnight, isSameDay } from "../../utils/date.utils";

// --- Local Strongly Typed Interface for Grid Cells ---
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

    readonly calendarCells = computed<CalendarCell[]>(() => {
        const year = this.currentYear();
        const month = this.currentMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        let startOffset = firstDayOfMonth.getDay() - 1;
        if (startOffset === -1) startOffset = 6;

        if (startOffset === 0) {
            startOffset = 7;
        }

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

        const currentValue = this.value();
        const startDrag = this.dragStartCellDate();
        const currentDrag = this.dragCurrentCellDate();
        const dragging = this.isDragging();
        const dragSnapshot = this.initialSelectedStateBeforeDrag();
        const targetState = this.dragTargetState();

        let dragMinT = Infinity;
        let dragMaxT = -Infinity;
        if (dragging && startDrag && currentDrag) {
            const startT = toMidnight(startDrag).getTime();
            const endT = toMidnight(currentDrag).getTime();
            dragMinT = Math.min(startT, endT);
            dragMaxT = Math.max(startT, endT);
        }

        for (let row = 0; row < totalRows; row++) {
            const firstDateOfRow = new Date(
                gridStartDate.getFullYear(),
                gridStartDate.getMonth(),
                gridStartDate.getDate() + (row * 7)
            );

            cells.push({
                id: `week-${row}-${firstDateOfRow.getTime()}`,
                date: null,
                isCurrentMonth: false,
                isDisabled: true,
                isSelected: false,
                isInDragRange: false,
                isWeekNum: true,
                weekNumber: this.getISOWeekNumber(firstDateOfRow),
                isRangeStart: false,
                isRangeEnd: false
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
                if (!this.isMultiSelect()) {
                    isSelected = currentValue instanceof Date && isSameDay(currentValue, cellMidnight);
                } else if (Array.isArray(currentValue)) {
                    isSelected = currentValue.some(d => isSameDay(d, cellMidnight));
                }

                let isInDragRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;

                if (dragging && startDrag && currentDrag && !isDisabled) {
                    if (timestamp >= dragMinT && timestamp <= dragMaxT) {
                        isInDragRange = true;
                        isSelected = targetState;

                        if (timestamp === dragMinT) isRangeStart = true;
                        if (timestamp === dragMaxT) isRangeEnd = true;
                    } else {
                        isSelected = dragSnapshot.get(timestamp) || false;
                    }
                }

                cells.push({
                    id: String(timestamp),
                    date: cellDate,
                    isCurrentMonth: cellDate.getMonth() === month,
                    isDisabled,
                    isSelected,
                    isInDragRange,
                    isWeekNum: false,
                    weekNumber: null,
                    isRangeStart,
                    isRangeEnd
                });
            }
        }

        return cells;
    });

    constructor() {
        effect(() => {
            const val = this.value();
            if (val && !this.isInitialized) {
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
            }
        });
    }

    onMouseDown(cell: CalendarCell, event: MouseEvent): void {
        if (cell.isWeekNum || cell.isDisabled) return;

        if (!this.isMultiSelect()) {
            if (cell.date) this.value.set(cell.date);
            return;
        }

        this.dragStartCellDate.set(cell.date);
        this.dragCurrentCellDate.set(cell.date);

        this.dragTargetState.set(!cell.isSelected);
        this.isDragging.set(true);

        const snapshotMap = new Map<number, boolean>();
        const currentDates = this.value() as Date[] || [];

        currentDates.forEach(d => {
            snapshotMap.set(toMidnight(d).getTime(), true);
        });

        this.initialSelectedStateBeforeDrag.set(snapshotMap);
    }

    onMouseEnter(cell: CalendarCell): void {
        if (!this.isDragging() || cell.isWeekNum) return;
        this.dragCurrentCellDate.set(cell.date);
    }

    onGridMouseLeave(): void {
        // Keeps drag engine context alive smoothly
    }

    @HostListener("window:mouseup", ["$event"])
    onMouseUpGlobal(): void {
        if (!this.isDragging()) return;

        const startDrag = this.dragStartCellDate();
        const currentDrag = this.dragCurrentCellDate();
        const dragSnapshot = this.initialSelectedStateBeforeDrag();
        const targetState = this.dragTargetState();

        if (startDrag && currentDrag) {
            const startT = toMidnight(startDrag).getTime();
            const endT = toMidnight(currentDrag).getTime();
            const minT = Math.min(startT, endT);
            const maxT = Math.max(startT, endT);

            const previousSelection = this.value() as Date[] || [];
            const updatedSelectionMap = new Map<number, Date>();

            previousSelection.forEach(d => {
                const t = toMidnight(d).getTime();
                if (t < minT || t > maxT) {
                    updatedSelectionMap.set(t, d);
                }
            });

            this.calendarCells().forEach(cell => {
                if (cell.isWeekNum) return;

                const t = Number(cell.id);
                if (t >= minT && t <= maxT && !cell.isDisabled && cell.date) {
                    if (targetState) {
                        updatedSelectionMap.set(t, toMidnight(cell.date));
                    } else {
                        updatedSelectionMap.delete(t);
                    }
                }
            });

            this.value.set(Array.from(updatedSelectionMap.values()));

            this.currentMonth.set(currentDrag.getMonth());
            this.currentYear.set(currentDrag.getFullYear());
        }

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

    private getISOWeekNumber(date: Date): number {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    }
}
