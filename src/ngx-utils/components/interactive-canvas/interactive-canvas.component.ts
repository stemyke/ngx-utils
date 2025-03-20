import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    ViewChild
} from "@angular/core";
import {Subscription} from "rxjs";

import {InteractiveCanvas, InteractiveCanvasPointer, InteractiveDrawFn, InteractivePanEvent} from "../../common-types";
import {Point} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";

@Component({
    standalone: false,
    selector: "interactive-canvas",
    styleUrls: ["./interactive-canvas.component.scss"],
    templateUrl: "./interactive-canvas.component.html"
})
export class InteractiveCanvasComponent implements InteractiveCanvas, OnInit, OnDestroy, AfterViewInit, OnChanges {

    @Input() horizontal: boolean;
    @Input() selectedIndex: number;
    @Input() resizeMode: "fit" | "fill";
    @Input() realWidth: number;
    @Input() realHeight: number;
    @Input() onDraw: InteractiveDrawFn;

    @Output() selectedIndexChange: EventEmitter<number>;

    canvasWidth: number;
    canvasHeight: number;
    ratio: number;

    fullHeight: number;
    ctx: CanvasRenderingContext2D;

    pan: number;
    rotation: number;

    get selectedItem(): InteractiveItemComponent {
        return this.items[this.selectedIndex];
    }

    get hoveredItem(): InteractiveItemComponent {
        return this.items[this.hoveredIndex];
    }

    get lockedItem(): InteractiveItemComponent {
        return this.items[this.lockedIndex];
    }

    protected shouldDraw: boolean;
    protected panOffset: number;
    protected hoveredIndex: number;
    protected items: ReadonlyArray<InteractiveItemComponent>;
    protected subscription: Subscription;

    @ViewChild("containerElem", {static: true})
    protected containerElem: ElementRef<HTMLDivElement>;

    @ViewChild("canvasElem", {static: true})
    protected canvasElem: ElementRef<HTMLCanvasElement>;

    @ContentChildren(InteractiveItemComponent)
    protected itemList: QueryList<InteractiveItemComponent>;

    protected touched: boolean;
    protected deltaX: number;
    protected deltaY: number;
    protected lockedIndex: number;

    constructor(protected renderer: Renderer2) {
        this.horizontal = false;
        this.selectedIndex = 0;
        this.resizeMode = "fit";
        this.onDraw = () => {};
        this.selectedIndexChange = new EventEmitter<number>();
        this.shouldDraw = true;
        this.panOffset = 0;
        this.pan = 0;
        this.rotation = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.hoveredIndex = null;
        this.items = [];
        this.touched = false;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    ngOnInit() {
        this.redraw();
    }

    ngOnDestroy() {
        this.shouldDraw = false;
        this.subscription?.unsubscribe();
    }

    ngOnChanges() {
        this.resize();
    }

    ngAfterViewInit() {
        this.subscription = this.itemList.changes.subscribe(() => this.fixItems());
        this.fixItems();
    }

    resize(): void {
        if (!this.canvasElem || !this.containerElem || !this.realWidth || !this.realWidth) return;
        const canvas = this.canvasElem.nativeElement;
        const container = this.containerElem.nativeElement;
        // Calculate canvas size
        const axisX = this.horizontal ? "height" : "width";
        const axisY = this.horizontal ? "width" : "height";
        const resize = this.resizeMode == "fit" ? Math.min : Math.max;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        this.ratio = resize(canvas[axisX] / this.realWidth, canvas[axisY] / this.realHeight);
        if (this.resizeMode == "fit") {
            canvas[axisX] = this.realWidth * this.ratio;
            canvas[axisY] = this.realHeight * this.ratio;
        }
        this.canvasWidth = canvas[axisX];
        this.canvasHeight = canvas[axisY];
        this.fullHeight = this.realHeight * this.ratio;
        this.panOffset = -this.fullHeight;
        this.fixPan();
    }

    onTouchStart($event: TouchEvent): void {
        this.hoveredIndex = this.getIndexUnderPointer($event.touches.item(0));
        this.touched = true;
    }

    @HostListener("window:touchend", ["$event"])
    onTouchEnd($event: TouchEvent): void {
        this.selectItem($event.touches.item(0));
    }

    onMouseDown(): void {
        this.touched = true;
    }

    @HostListener("window:mouseup", ["$event"])
    onMouseUp($event: MouseEvent): void {
        this.selectItem($event);
    }

    onMouseMove($event: MouseEvent): void {
        if (this.touched) return;
        this.hoveredIndex = this.getIndexUnderPointer($event);
        this.updateCursor();
    }

    onMouseLeave(): void {
        this.hoveredIndex = null;
        this.updateCursor();
    }

    onPanStart($event: InteractivePanEvent): void {
        this.lockedIndex = this.getIndexUnderPointer($event?.pointers[0]);
        this.lockedItem?.onPanStart.emit({
            pointers: [],
            deltaX: 0,
            deltaY: 0,
            item: this.lockedItem
        });
        this.deltaX = 0;
        this.deltaY = 0;
    }

    onPan($event: InteractivePanEvent): void {
        const item = this.lockedItem;
        const deltaX = ($event.deltaX - this.deltaX) / this.ratio;
        const deltaY = ($event.deltaY - this.deltaY) / this.ratio;
        if (item) {
            const data: InteractivePanEvent = this.horizontal
                ? {pointers: $event.pointers, deltaX: -deltaY, deltaY: +deltaX}
                : {pointers: $event.pointers, deltaX, deltaY};
            data.item = item
            item.onPan.emit(data);
        } else if (this.resizeMode == "fill") {
            this.pan += this.horizontal ? deltaX : deltaY;
            this.fixPan();
        }
        this.deltaX = $event.deltaX;
        this.deltaY = $event.deltaY;
    }

    onPanEnd(): void {
        const item = this.lockedItem;
        item?.onPanEnd.emit({
            pointers: [],
            deltaX: 0,
            deltaY: 0,
            item
        });
        this.lockedIndex = -1;
    }

    protected fixPan(): void {
        if (this.fullHeight <= 0) return;
        while (this.pan > 0) {
            this.pan -= this.fullHeight;
        }
        while (this.pan < -this.fullHeight) {
            this.pan += this.fullHeight;
        }
        this.rotation = Math.round(this.pan / this.fullHeight * 360);
        const basePan = (this.rotation / 360 - 1) * this.fullHeight;
        const cycles = this.resizeMode == "fit" ? [0] : [basePan - this.fullHeight, basePan, basePan + this.fullHeight];
        this.items.forEach(item => {
            item.calcShapes(cycles);
        });
    }

    protected fixItems(): void {
        this.items = this.itemList.toArray();
        this.items.forEach((item, ix) => {
            item.index = ix;
        });
        this.fixPan();
    }

    protected selectItem(pointer: InteractiveCanvasPointer): void {
        const selected = this.getIndexUnderPointer(pointer);
        this.touched = false;
        if (selected !== this.selectedIndex) {
            this.selectedIndex = selected;
            this.selectedIndexChange.emit(this.selectedIndex);
            const item = this.selectedItem;
            if (!item) return;
            item.active = !item.active;
        }
    }

    protected getIndexUnderPointer(pointer: InteractiveCanvasPointer): number {
        if (!pointer || !this.canvasElem || !this.items) return null;
        const canvasRect = this.canvasElem.nativeElement.getBoundingClientRect();
        const point = this.horizontal
            ? new Point(canvasRect.bottom - pointer.clientY, pointer.clientX - canvasRect.left)
            : new Point(pointer.clientX - canvasRect.left, pointer.clientY - canvasRect.top);
        const length = this.items.length;
        for (let ix = 0; ix < length; ix++) {
            const item = this.items[ix];
            if (item?.hit(point)) {
                return item.disabled ? null : ix;
            }
        }
        return -1;
    }

    protected updateCursor(): void {
        const cursor = this.getCursor();
        this.renderer.setStyle(this.canvasElem.nativeElement, "cursor", cursor);
        this.renderer.setStyle(this.containerElem.nativeElement, "cursor", cursor);
    }

    protected getCursor(): string {
        const hovered = this.hoveredItem;
        if (!hovered) return "default";
        switch (hovered.direction) {
            case "free":
                return "all-scroll";
            case "horizontal":
                return "";
            case "vertical":
                return "row-resize";
        }
        return "pointer";
    }

    protected redraw() {
        if (!this.shouldDraw) return;
        this.ctx = this.canvasElem.nativeElement?.getContext("2d");
        if (!this.ctx) {
            requestAnimationFrame(() => this.redraw());
            return;
        }
        this.draw().then(() => {
            requestAnimationFrame(() => this.redraw());
        });
    }

    protected async draw() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const width = this.realWidth * this.ratio;
        const height = this.realHeight * this.ratio;
        const x = canvas.width / 2 - width / 2;
        const y = canvas.height / 2 - height / 2;
        if (this.horizontal) {
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-this.canvasWidth, 0);
        }
        await this.onDraw(this, this.items);
        ctx.restore();
    }
}
