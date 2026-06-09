import {Component, computed, effect, input, model, signal, ViewEncapsulation} from "@angular/core";

// Helper to normalize dates to midnight UTC/Local depending on your needs, keeping it simple here
const toMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (d1: Date, d2: Date) => d1.getTime() === d2.getTime();

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

    /**
     * Value can be a single Date or an array of Dates
     */
    readonly value = model<Date | Date[] | null>(null);

    /**
     * Minimum date (as iso string or actual date object)
     */
    readonly min = input<string | Date | null>(null);

    /**
     * Maximum date (as iso string or actual date object)
     */
    readonly max = input<string | Date | null>(null);

    /**
     * Disabled list if dates (as iso strings or actual date objects)
     */
    readonly disabledDates = input<(string | Date)[] | null>([]);

    /**
     * Disabled days of week from 0-7, where 0 and 7 both means saturday
     */
    readonly disabledDays = input<number[]>([]);

    // --- Internal Navigation Signals ---
    readonly currentMonth = signal<number>(new Date().getMonth());
    readonly currentYear = signal<number>(new Date().getFullYear());

    // --- Dragging Engine Signals ---
    private readonly isDragging = signal<boolean>(false);
    private readonly dragStartCellDate = signal<Date | null>(null);
    private readonly dragCurrentCellDate = signal<Date | null>(null);
    private readonly initialSelectedStateBeforeDrag = signal<Map<number, boolean>>(new Map());

    // --- Parsed Signal Restrictions ---
    private readonly minDate = computed(() => this.parseValidDate(this.min()));
    private readonly maxDate = computed(() => this.parseValidDate(this.max()));

    private readonly disabledTimestamps = computed(() => {
        const inputs = this.disabledDates() || [];
        return inputs
            .map(d => this.parseValidDate(d))
            .filter((d): d is Date => d !== null)
            .map(d => toMidnight(d).getTime());
    });

    // Determines mode dynamically based on the bound value structure
    readonly isMultiSelect = computed(() => Array.isArray(this.value()));

    // --- Computed Grid Generation ---
    readonly calendarCells = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();

        // First day of current display month
        const firstDayOfMonth = new Date(year, month, 1);
        // Determine offset day index mapped to Mon -> Sun (0 -> 6)
        // JS days: 0 (Sun) - 6 (Sat). Custom mapping:
        let startOffset = firstDayOfMonth.getDay() - 1;
        if (startOffset === -1) startOffset = 6; // Sunday becomes last index

        // Get grid start date (rolling back into previous month view if needed)
        const gridStartDate = new Date(year, month, 1 - startOffset);

        const cells = [];
        const totalGridSlots = 42; // standard 6-row calendar layout

        const min = this.minDate();
        const max = this.maxDate();
        const disabledTimes = this.disabledTimestamps();
        const disDays = this.disabledDays();

        // Map internal JS day index (0=Sun, 1=Mon...6=Sat) to custom disabled layout rule where 0 and 7 = Sat
        const isDayOfWeekDisabled = (jsDay: number) => {
            return disDays.some(d => {
                if (d === 0 || d === 7) return jsDay === 6; // Saturday restriction
                if (d === 1) return jsDay === 1; // Mon
                if (d === 2) return jsDay === 2; // Tue
                if (d === 3) return jsDay === 3; // Wed
                if (d === 4) return jsDay === 4; // Thu
                if (d === 5) return jsDay === 5; // Fri
                if (d === 6) return jsDay === 0; // Sunday restriction
                return false;
            });
        };

        const currentValue = this.value();
        const startDrag = this.dragStartCellDate();
        const currentDrag = this.dragCurrentCellDate();

        for (let i = 0; i < totalGridSlots; i++) {
            const cellDate = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + i);
            const cellMidnight = toMidnight(cellDate);
            const timestamp = cellMidnight.getTime();

            // Check restrictions
            let isDisabled = false;
            if (min && cellMidnight < toMidnight(min)) isDisabled = true;
            if (max && cellMidnight > toMidnight(max)) isDisabled = true;
            if (disabledTimes.includes(timestamp)) isDisabled = true;
            if (isDayOfWeekDisabled(cellMidnight.getDay())) isDisabled = true;

            // Determine regular selection state
            let isSelected = false;
            if (!this.isMultiSelect()) {
                isSelected = currentValue instanceof Date && isSameDay(currentValue, cellMidnight);
            } else if (Array.isArray(currentValue)) {
                isSelected = currentValue.some(d => isSameDay(d, cellMidnight));
            }

            // Handle Live Negation Drag state overlay mechanics
            let isInDragRange = false;
            if (this.isDragging() && startDrag && currentDrag && !isDisabled) {
                const startT = toMidnight(startDrag).getTime();
                const endT = toMidnight(currentDrag).getTime();
                const minT = Math.min(startT, endT);
                const maxT = Math.max(startT, endT);

                if (timestamp >= minT && timestamp <= maxT) {
                    isInDragRange = true;
                    // Negate original selection state during drag window overlay
                    const originalState = this.initialSelectedStateBeforeDrag().get(timestamp) || false;
                    isSelected = !originalState;
                } else {
                    // Revert back to original historical baseline state outside current drag bounds
                    isSelected = this.initialSelectedStateBeforeDrag().get(timestamp) || false;
                }
            }

            cells.push({
                id: timestamp,
                date: cellDate,
                isCurrentMonth: cellDate.getMonth() === month,
                isDisabled,
                isSelected,
                isInDragRange
            });
        }

        return cells;
    });

    // Sync viewpoint view with current value on initial load
    constructor() {
        effect(() => {
            const val = this.value();
            if (val) {
                const referenceDate = Array.isArray(val) ? val[0] : val;
                if (referenceDate instanceof Date) {
                    this.currentMonth.set(referenceDate.getMonth());
                    this.currentYear.set(referenceDate.getFullYear());
                }
            }
        }, { allowSignalWrites: true });
    }

    // --- Interaction Event Methods ---
    onMouseDown(cell: any, event: MouseEvent) {
        if (cell.isDisabled) return;

        if (!this.isMultiSelect()) {
            this.value.set(cell.date);
            return;
        }

        // Initialize Multi-selection Drag Engine Configuration
        this.isDragging.set(true);
        this.dragStartCellDate.set(cell.date);
        this.dragCurrentCellDate.set(cell.date);

        // Snapshot state profiles inside current grid window to compute fast visual mutations
        const snapshotMap = new Map<number, boolean>();
        this.calendarCells().forEach(c => {
            snapshotMap.set(c.id, c.isSelected);
        });
        this.initialSelectedStateBeforeDrag.set(snapshotMap);
    }

    onMouseEnter(cell: any) {
        if (!this.isDragging() || cell.isDisabled) return;
        this.dragCurrentCellDate.set(cell.date);
    }

    onGridMouseLeave() {
        // Keeps drag alive but cleans path views outside scope boundaries if preferred
    }

    onMouseUpGlobal() {
        if (!this.isDragging()) return;

        // Persist visual calculated states into model value array binding context
        const mutatedArraySelection: Date[] = [];
        this.calendarCells().forEach(cell => {
            if (cell.isSelected && !cell.isDisabled) {
                mutatedArraySelection.push(toMidnight(cell.date));
            }
        });

        this.value.set(mutatedArraySelection);

        // Reset Drag state machine
        this.isDragging.set(false);
        this.dragStartCellDate.set(null);
        this.dragCurrentCellDate.set(null);
        this.initialSelectedStateBeforeDrag.set(new Map());
    }

    // --- Month Navigation Actions ---
    prevMonth() {
        if (this.currentMonth() === 0) {
            this.currentMonth.set(11);
            this.currentYear.update(y => y - 1);
        } else {
            this.currentMonth.update(m => m - 1);
        }
    }

    nextMonth() {
        if (this.currentMonth() === 11) {
            this.currentMonth.set(0);
            this.currentYear.update(y => y + 1);
        } else {
            this.currentMonth.update(m => m + 1);
        }
    }

    // --- Helper Methods ---
    private parseValidDate(value: string | Date | null): Date | null {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
}
