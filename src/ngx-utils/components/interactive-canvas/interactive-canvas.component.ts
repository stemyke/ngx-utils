import {
    Component,
    contentChildren,
    effect,
    ElementRef,
    HostListener, inject,
    input,
    model,
    OnDestroy,
    OnInit,
    output,
    Renderer2,
    untracked,
    ViewChild
} from "@angular/core";

import {
    CanvasPaintFunc,
    CanvasResizeMode,
    InteractiveCanvas,
    InteractiveCanvasItem,
    InteractiveCanvasParams,
    InteractiveCanvasPointer,
    InteractiveCanvasRenderer,
    InteractivePanEvent,
    IPoint,
    RangeCoords
} from "../../common-types";
import {Point, Rect, toRadians} from "../../utils/geometry";
import {normalizeRange, overflow} from "../../utils/math.utils";
import {UniversalService} from "../../services/universal.service";

import {InteractiveItemComponent} from "./interactive-item.component";
import {injectOptions} from "../../utils/misc";

const emptyDash: number[] = [];

@Component({
    standalone: false,
    selector: "interactive-canvas",
    styleUrls: ["./interactive-canvas.component.scss"],
    templateUrl: "./interactive-canvas.component.html"
})
export class InteractiveCanvasComponent implements InteractiveCanvas, OnInit, OnDestroy {

    /**
     * Injectable options
     * @private
     */
    protected readonly options = injectOptions({
        infinite: false,
        resizeMode: "fit" as CanvasResizeMode,
        panOffset: 0
    });

    protected readonly renderer = inject(Renderer2);

    protected readonly universal = inject(UniversalService);

    /**
     * Is the canvas infinitely scrollable?
     */
    readonly infinite = input(this.options.infinite);
    readonly resizeMode = input<CanvasResizeMode>(this.options.resizeMode);
    readonly horizontal = input(false);

    /**
     * Real life-size width of the canvas
     */
    readonly width = input(100);
    /**
     * Real life-size height of the canvas
     */
    readonly height = input(100);

    /**
     * Canvas params
     */
    readonly params = input({}, {
        transform: (v: InteractiveCanvasParams) => v || {}
    });

    /**
     * Model signal for selected index
     */
    readonly selectedIndex = model(0);
    /**
     * Relative offset of the panning. It is based on the rendered canvas height
     */
    readonly panOffset = input(this.options.panOffset);
    readonly renderCtx = input<Record<string, any>>({});
    readonly beforeItems = input<ReadonlyArray<InteractiveCanvasRenderer>>([]);
    readonly afterItems = input<ReadonlyArray<InteractiveCanvasRenderer>>([]);

    readonly onRotate = output<number>();
    readonly onItemPan = output<InteractivePanEvent>();
    readonly onItemPanned = output<InteractivePanEvent>();
    readonly onPan = output<InteractivePanEvent>();
    readonly onPanned = output<InteractivePanEvent>();

    readonly itemList = contentChildren(InteractiveItemComponent);

    get isInfinite(): boolean {
        return this.infinite();
    }

    get realWidth(): number {
        return this.width();
    }

    get realHeight(): number {
        return this.height();
    }

    get items(): ReadonlyArray<InteractiveItemComponent> {
        return this.itemList();
    }

    get canvas(): HTMLCanvasElement {
        return this.canvasElem?.nativeElement;
    }

    get lockedItem(): InteractiveItemComponent {
        return this.items[this.lockedIndex];
    }

    get selectedItem(): InteractiveItemComponent {
        return this.items[this.selectedIndex()];
    }

    set selectedItem(item: InteractiveItemComponent) {
        const ix = !item ? -1 : this.items.indexOf(item);
        const selected = untracked(() => this.selectedIndex());
        if (ix === selected) return;
        this.selectedIndex.set(ix);
    }

    get hoveredItem(): InteractiveItemComponent {
        return this.items[this.hoveredIndex];
    }

    set hoveredItem(item: InteractiveItemComponent) {
        this.hoveredIndex = !item ? -1 : this.items.indexOf(item);
    }

    xRange: RangeCoords;
    yRange: RangeCoords;

    ratio: number;
    styles: CSSStyleDeclaration;
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
    fullHeight: number;
    viewRatio: number;

    rotation: number;
    basePan: number;
    cycles: number[];
    excludedAreas: Rect[];

    protected tempCanvas: HTMLCanvasElement;
    protected shouldDraw: boolean;
    protected hoveredIndex: number;

    @ViewChild("containerElem", {static: true})
    protected containerElem: ElementRef<HTMLDivElement>;

    @ViewChild("canvasElem", {static: true})
    protected canvasElem: ElementRef<HTMLCanvasElement>;

    protected touched: boolean;
    protected panStartRotation: number;
    protected panStartPos: IPoint;
    protected lockedIndex: number;
    protected oldLength: number;

    constructor() {
        this.tempCanvas = this.universal.isServer ? null : document.createElement("canvas");
        this.shouldDraw = !this.universal.isServer;
        this.hoveredIndex = null;
        this.oldLength = 0;

        this.xRange = [0, 1];
        this.yRange = [0, 1];
        this.ratio = 1;
        this.styles = null;
        this.ctx = null;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.rotation = 0;
        this.basePan = 0;
        this.cycles = [0];
        this.excludedAreas = [];

        this.touched = false;
        this.panStartRotation = 0;
        this.panStartPos = Point.Zero;

        effect(() => {
            const items = this.itemList();
            const index = untracked(() => this.selectedIndex());
            const grow = items.length > this.oldLength;
            items.forEach((item, ix) => {
                item.canvas = this;
                item.index = ix;
            });
            this.fixRotation();
            const last = Math.max(0, items.length - 1);
            const selected = Math.min(grow ? last : index, last);
            this.selectedItem = items[selected];
            this.oldLength = items.length;
        });

        effect(() => {
            const realWidth = this.width();
            const realHeight = this.height();
            const params = this.params();
            this.xRange = normalizeRange(params.xRange || [0, realWidth]);
            this.yRange = normalizeRange(params.yRange || [0, realHeight]);
            this.resize();
        });
    }

    ngOnInit() {
        this.redraw();
    }

    ngOnDestroy() {
        this.shouldDraw = false;
    }

    async tempPaint(cb: CanvasPaintFunc): Promise<void> {
        const mainCanvas = this.canvas;
        const mainCtx = mainCanvas.getContext("2d");
        const canvas = this.tempCanvas;
        const ctx = canvas.getContext("2d");
        const transform = mainCtx.getTransform();

        canvas.width = mainCanvas.width;
        canvas.height = mainCanvas.height;

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(transform);

        mainCtx.resetTransform();
        mainCtx.globalCompositeOperation = await cb(ctx) || "source-over";
        mainCtx.drawImage(canvas, 0, 0);
        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.setTransform(transform);

        ctx.resetTransform();
    }

    resize(): void {
        const realWidth = this.width();
        const realHeight = this.height();
        const horizontal = this.horizontal();
        const resizeMode = this.resizeMode();
        if (!this.canvasElem || !this.containerElem) return;

        const canvas = this.canvasElem.nativeElement;
        const container = this.containerElem.nativeElement;
        // Calculate canvas size
        const axisX = horizontal ? "height" : "width";
        const axisY = horizontal ? "width" : "height";
        const resize = resizeMode == "fit" ? Math.min : Math.max;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        this.ratio = resize(canvas[axisX] / realWidth, canvas[axisY] / realHeight);
        if (resizeMode == "fit") {
            canvas[axisX] = realWidth * this.ratio;
            canvas[axisY] = realHeight * this.ratio;
        }
        this.styles = getComputedStyle(canvas);
        this.ctx = canvas.getContext("2d");
        this.canvasWidth = canvas[axisX];
        this.canvasHeight = canvas[axisY];
        this.fullHeight = this.realHeight * this.ratio;
        this.viewRatio = Math.round(this.canvasHeight / this.fullHeight * 100) / 100;
        this.fixRotation();
    }

    onTouchStart($event: TouchEvent): void {
        this.hoveredIndex = this.getIndexUnderPointer($event.touches.item(0));
        this.lockedIndex = this.hoveredIndex;
        this.selectItem();
    }

    @HostListener("window:touchend")
    onTouchEnd(): void {
        this.touched = false;
    }

    onMouseDown($event: MouseEvent): void {
        this.lockedIndex = this.getIndexUnderPointer($event);
        this.selectItem();
    }

    @HostListener("window:mouseup")
    onMouseUp(): void {
        this.touched = false;
    }

    onMouseMove($event: MouseEvent): void {
        if (this.touched) return;
        this.hoveredIndex = this.getIndexUnderPointer($event);
        this.updateCursor();
    }

    onMouseLeave(): void {
        if (this.touched) return;
        this.hoveredIndex = null;
        this.updateCursor();
    }

    onPanStart(): void {
        this.panStartRotation = this.rotation;
        this.panStartPos = this.lockedItem?.position || Point.Zero;
    }

    onPanMove($event: any): void {
        const item = this.lockedItem;
        const horizontal = untracked(() => this.horizontal());
        const deltaX = $event.deltaX / this.ratio;
        const deltaY = $event.deltaY / this.ratio;
        const data: InteractivePanEvent = {
            canvas: this,
            item,
            deltaX,
            deltaY
        };
        if (horizontal) {
            data.deltaX = -deltaY;
            data.deltaY = +deltaX;
        }
        if (item) {
            item.moveTo(this.panStartPos.x + data.deltaX, this.panStartPos.y + data.deltaY);
            this.onItemPan.emit(data);
            return;
        }
        const infinite = untracked(() => this.infinite());
        if (!infinite) return;
        this.rotation = this.panStartRotation + (horizontal ? deltaX : deltaY) / this.realHeight * 360;
        this.fixRotation();
        this.onPan.emit(data);
    }

    onPanEnd(): void {
        const item = this.lockedItem;
        const data: InteractivePanEvent = {
            canvas: this,
            deltaX: 0,
            deltaY: 0,
            item
        };
        if (item) {
            item.moveEnd();
            this.onItemPanned.emit(data);
        } else {
            this.onPanned.emit(data);
        }
        this.lockedIndex = -1;
    }

    protected fixRotation(): void {
        // No need to track params changes because this function will be called from an effect
        // already depending on params anyway
        const params = untracked(() => this.params());
        if (this.fullHeight <= 0) return;
        this.rotation = overflow(Math.round(this.rotation * 100) / 100, -180, 180);
        this.basePan = this.rotation / 360 * this.fullHeight
            + this.canvasHeight * untracked(() => this.panOffset());
        this.cycles = this.infinite
            ? [this.basePan - this.fullHeight, this.basePan, this.basePan + this.fullHeight] : [0];
        this.excludedAreas = (params.excludedAreas || []).flatMap(coords => {
            const x = coords.x * this.ratio;
            const y = coords.y * this.ratio;
            const width = coords.width * this.ratio;
            const height = coords.height * this.ratio;
            return this.cycles.map(cycle => {
                return new Rect(x, y + cycle, width, height);
            });
        });
        this.items.forEach(item => {
            item.canvasParams = params;
            item.calcShapes();
        });
        this.onRotate.emit(this.rotation);
    }

    protected selectItem(): void {
        this.touched = true;
        const item = this.items[this.lockedIndex];
        if (!item) return;
        this.selectedItem = item;
    }

    protected toCanvasPoint(pointer: InteractiveCanvasPointer): Point {
        if (!pointer || !this.canvas) return null;
        const canvasRect = this.canvas?.getBoundingClientRect();
        return this.horizontal()
            ? new Point(canvasRect.bottom - pointer.clientY, pointer.clientX - canvasRect.left)
            : new Point(pointer.clientX - canvasRect.left, pointer.clientY - canvasRect.top);
    }

    protected getIndexUnderPointer(pointer: InteractiveCanvasPointer): number {
        const point = this.toCanvasPoint(pointer);
        if (!point || !this.items) return -1;
        const length = this.items.length;
        for (let ix = 0; ix < length; ix++) {
            const item = this.items[ix];
            if (item?.hit(point)) {
                return item.disabled ? -1 : ix;
            }
        }
        return -1;
    }

    protected updateCursor(): void {
        const cursor = this.getCursor();
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
        if (!this.ctx) {
            requestAnimationFrame(() => this.redraw());
            return;
        }
        this.draw().then(() => {
            requestAnimationFrame(() => this.redraw());
        });
    }

    protected async drawItems(): Promise<void> {
        const ctx = this.ctx;
        const lockedItem = this.lockedItem;
        for (const item of this.items) {
            if (item !== lockedItem) {
                await this.drawItem(ctx, item);
            }
        }
        if (!lockedItem) return;
        await this.drawItem(ctx, lockedItem);
    }

    protected async drawItem(ctx: CanvasRenderingContext2D, item: InteractiveCanvasItem): Promise<void> {
        for (const shape of item.shapes) {
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.setLineDash(emptyDash);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            await item.draw(ctx, shape);
            ctx.restore();
        }
    }

    protected async draw() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        if (canvas.width < 1 || canvas.height < 1) return;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.setLineDash(emptyDash);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (this.horizontal()) {
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-this.canvasWidth, 0);
        }
        const renderCtx = untracked(() => this.renderCtx());
        const beforeItems = untracked(() => this.beforeItems());
        const afterItems = untracked(() => this.afterItems());
        try {
            for (const renderer of beforeItems) {
                await renderer(this, renderCtx);
            }
            await this.drawItems();
            for (const renderer of afterItems) {
                await renderer(this, renderCtx);
            }
        } catch (e) {
            console.warn(`There was an error rendering the canvas: ${e}`);
        }
        ctx.restore();
    }
}
