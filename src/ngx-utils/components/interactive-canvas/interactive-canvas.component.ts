import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    ViewChild
} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";

import {
    CanvasPaintFunc,
    InteractiveCanvas,
    InteractiveCanvasPointer,
    InteractiveCanvasRenderer,
    InteractivePanEvent
} from "../../common-types";
import {Oval, Point, Rect, toRadians} from "../../utils/geometry";
import {InteractiveItemComponent} from "./interactive-item.component";
import {ROOT_ELEMENT} from "../../tokens";
import {UniversalService} from "../../services/universal.service";
import {drawOval, drawRect} from "../../utils/canvas";

@Component({
    standalone: false,
    selector: "interactive-canvas",
    styleUrls: ["./interactive-canvas.component.scss"],
    templateUrl: "./interactive-canvas.component.html"
})
export class InteractiveCanvasComponent implements InteractiveCanvas, OnInit, OnDestroy, AfterViewInit, OnChanges {

    @Input() debug: boolean;
    @Input() horizontal: boolean;
    @Input() selectedIndex: number;
    @Input() resizeMode: "fit" | "fill";
    @Input() realWidth: number;
    @Input() realHeight: number;
    @Input() panOffset: number;
    @Input() params: Record<string, any>;
    @Input() renderCtx: Record<string, any>;
    @Input() beforeItems: ReadonlyArray<InteractiveCanvasRenderer>;
    @Input() afterItems: ReadonlyArray<InteractiveCanvasRenderer>;

    @Output() selectedIndexChange: EventEmitter<number>;
    @Output() onRotate: EventEmitter<number>;
    @Output() onItemPan: EventEmitter<InteractivePanEvent>;
    @Output() onItemPanned: EventEmitter<InteractivePanEvent>;
    @Output() onPan: EventEmitter<InteractivePanEvent>;
    @Output() onPanned: EventEmitter<InteractivePanEvent>;

    readonly $items: BehaviorSubject<InteractiveItemComponent[]>;

    get items(): ReadonlyArray<InteractiveItemComponent> {
        return this.$items.value;
    }

    get canvas(): HTMLCanvasElement {
        return this.canvasElem?.nativeElement;
    }

    get lockedItem(): InteractiveItemComponent {
        return this.items[this.lockedIndex];
    }

    get selectedItem(): InteractiveItemComponent {
        return this.items[this.selectedIndex];
    }

    get hoveredItem(): InteractiveItemComponent {
        return this.items[this.hoveredIndex];
    }

    set hoveredItem(item: InteractiveItemComponent) {
        this.hoveredIndex = !item ? -1 : this.items.indexOf(item);
    }

    ratio: number;
    styles: CSSStyleDeclaration;
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;

    rotation: number;
    basePan: number;
    cycles: number[];

    fullHeight: number;
    viewRatio: number;

    protected tempCanvas: HTMLCanvasElement;
    protected shouldDraw: boolean;
    protected hoveredIndex: number;
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

    constructor(readonly renderer: Renderer2,
                readonly universal: UniversalService,
                readonly element: ElementRef<HTMLElement>,
                @Inject(ROOT_ELEMENT) readonly rootElement: HTMLElement) {
        this.debug = false;
        this.horizontal = false;
        this.selectedIndex = 0;
        this.resizeMode = "fit";
        this.realWidth = 100;
        this.realHeight = 100;
        this.panOffset = 0;
        this.params = {};
        this.beforeItems = [];
        this.afterItems = [];
        this.selectedIndexChange = new EventEmitter();
        this.onRotate = new EventEmitter();
        this.onItemPan = new EventEmitter();
        this.onItemPanned = new EventEmitter();
        this.onPan = new EventEmitter();
        this.onPanned = new EventEmitter();
        this.$items = new BehaviorSubject([]);
        this.tempCanvas = this.universal.isServer ? null : document.createElement("canvas");
        this.shouldDraw = !this.universal.isServer;
        this.rotation = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.hoveredIndex = null;
        this.touched = false;
        this.deltaX = 0;
        this.deltaY = 0;
        this.ctrInit();
    }

    ctrInit(): void {

    }

    ngOnInit() {
        this.redraw();
    }

    ngOnDestroy() {
        this.shouldDraw = false;
        this.subscription?.unsubscribe();
    }

    ngOnChanges() {
        this.params = this.params || {};
        this.renderCtx = this.renderCtx || {};
        this.beforeItems = this.beforeItems || [];
        this.afterItems = this.afterItems || [];
        this.resize();
    }

    ngAfterViewInit() {
        this.subscription = this.itemList.changes.subscribe(() => this.fixItems());
        this.fixItems();
    }

    async tempPaint(cb: CanvasPaintFunc): Promise<void> {
        const renderCanvas = this.canvas;
        const canvas = this.tempCanvas;

        canvas.width = renderCanvas.width;
        canvas.height = renderCanvas.height;

        const ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bgCtx = renderCanvas.getContext("2d");

        bgCtx.globalCompositeOperation = await cb(ctx) || "source-over";
        bgCtx.drawImage(canvas, 0, 0);
        bgCtx.globalCompositeOperation = "source-over";
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
        this.touched = true;
    }

    @HostListener("window:touchend", ["$event"])
    onTouchEnd($event: TouchEvent): void {
        this.selectItem($event.touches.item(0));
    }

    onMouseDown($event: MouseEvent): void {
        this.lockedIndex = this.getIndexUnderPointer($event);
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

    onPanStart(): void {
        this.deltaX = 0;
        this.deltaY = 0;
    }

    onPanMove($event: any): void {
        const item = this.lockedItem;
        const deltaX = ($event.deltaX - this.deltaX) / this.ratio;
        const deltaY = ($event.deltaY - this.deltaY) / this.ratio;
        const data: InteractivePanEvent = {
            canvas: this,
            pointers: $event.pointers,
            item,
            deltaX,
            deltaY
        };
        if (this.horizontal) {
            data.deltaX = -deltaY;
            data.deltaY = +deltaX;
        }
        if (item) {
            item.moveBy(data.deltaX, data.deltaY);
            this.onItemPan.emit(data);
        } else if (this.resizeMode == "fill") {
            this.rotation += (this.horizontal ? deltaX : deltaY) / this.realHeight * 360;
            this.fixRotation();
            this.onPan.emit(data);
        }
        this.deltaX = $event.deltaX;
        this.deltaY = $event.deltaY;
    }

    onPanEnd(): void {
        const item = this.lockedItem;
        const data: InteractivePanEvent = {
            canvas: this,
            pointers: [],
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
        if (this.fullHeight <= 0) return;
        this.rotation = ((this.rotation + 180) % 360 + 360) % 360 - 180;
        this.rotation = Math.round(this.rotation * 100) / 100;
        this.basePan = (this.rotation / 360 - 1) * this.fullHeight + this.canvasHeight * this.panOffset;
        this.cycles = this.resizeMode == "fit"
            ? [0] : [this.basePan - this.fullHeight, this.basePan, this.basePan + this.fullHeight];
        this.items.forEach(item => {
            item.calcShapes();
        });
        this.onRotate.emit(this.rotation);
    }

    protected fixItems(): void {
        const items = this.itemList.toArray();
        this.$items.next(items);
        items.forEach((item, ix) => {
            item.canvas = this;
            item.index = ix;
        });
        this.fixRotation();
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
        for (const item of this.items) {
            for (const shape of item.shapes) {
                ctx.save();
                ctx.translate(shape.x, shape.y);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                await item.draw(ctx);
                ctx.restore();
            }
        }
        if (!this.debug) return;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(114,232,45,0.55)";
        for (const item of this.items) {
            for (const shape of item.shapes) {
                ctx.save();
                ctx.translate(shape.x, shape.y);
                if (shape instanceof Rect || shape instanceof Oval) {
                    ctx.rotate(toRadians(shape.rotation));
                    if (shape instanceof Oval) {
                        drawOval(ctx, shape.width, shape.height);
                    } else {
                        drawRect(ctx, shape.width, shape.height);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    }

    protected async draw() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        if (canvas.width < 1 || canvas.height < 1) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (this.horizontal) {
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-this.canvasWidth, 0);
        }
        try {
            for (const renderer of this.beforeItems) {
                await renderer(this, this.renderCtx);
            }
            await this.drawItems();
            for (const renderer of this.afterItems) {
                await renderer(this, this.renderCtx);
            }
        } catch (e) {
            console.warn(`There was an error rendering the canvas: ${e}`);
        }
        ctx.restore();
    }
}
