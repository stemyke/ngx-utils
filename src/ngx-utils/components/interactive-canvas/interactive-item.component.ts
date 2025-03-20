import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from "@angular/core";
import {Subscription} from "rxjs";
import {
    CanvasItemDirection,
    CanvasItemShape,
    InteractiveCanvas,
    InteractiveCanvasItem,
    InteractivePanEvent,
    IShape
} from "../../common-types";
import {Point} from "../../utils/geometry";
import {ObservableUtils} from "../../utils/observable.utils";

@Component({
    standalone: false,
    selector: "__interactive-item__",
    template: ""
})
export class InteractiveItemComponent implements OnDestroy, OnChanges, InteractiveCanvasItem {

    protected basePan: number;
    protected pos: Point;
    protected mShapes: IShape[];
    protected subscription: Subscription;
    protected deltaX: number;
    protected deltaY: number;

    @Input()
    set x(value: number) {
        if (isNaN(value)) return;
        this.pos = new Point(value, this.pos.y);
    }

    @Input()
    set y(value: number) {
        if (isNaN(value)) return;
        this.pos = new Point(this.pos.x, value);
    }

    @Input()
    set position(value: Point) {
        if (!(value instanceof Point)) return;
        this.pos = value;
    }

    @Input() rotation: number;
    @Input() direction: CanvasItemDirection;
    @Input() disabled: boolean;

    @Output() onClick: EventEmitter<InteractiveCanvasItem>;
    @Output() onPan: EventEmitter<InteractivePanEvent>;
    @Output() onPanStart: EventEmitter<InteractiveCanvasItem>;
    @Output() onPanEnd: EventEmitter<InteractiveCanvasItem>;

    active: boolean;
    index: number;

    get shapes(): ReadonlyArray<IShape> {
        return this.mShapes;
    }

    get canvas(): InteractiveCanvas {
        return null;
    }

    get position() {
        return this.pos;
    }

    get x(): number {
        return this.pos.x;
    }

    get y(): number {
        return this.pos.y;
    }

    get shape(): CanvasItemShape {
        return null;
    }

    constructor() {
        this.onClick = new EventEmitter();
        this.onPan = new EventEmitter();
        this.onPanStart = new EventEmitter();
        this.onPanEnd = new EventEmitter();
        this.active = false;
        this.index = -1;
        this.basePan = 0;
        this.pos = Point.Zero;
        this.rotation = 0;
        this.direction = "none";
        this.mShapes = [];
        this.subscription = ObservableUtils.multiSubscription(
            this.onPanStart.subscribe(() => {
                this.deltaX = 0;
                this.deltaY = 0;
            }),
            this.onPan.subscribe(ev => {
                const dx = ev.deltaX - this.deltaX;
                const dy = ev.deltaY - this.deltaY;
                switch (this.direction) {
                    case "free":
                        this.x += dx;
                        this.y += dy;
                        break;
                    case "horizontal":
                        this.x += dx;
                        break;
                    case "vertical":
                        this.y += dy;
                        break;
                }
                if (this.direction !== "none") {
                    this.calcShapes();
                }
                this.deltaX = ev.deltaX;
                this.deltaY = ev.deltaY;
            })
        )
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    ngOnChanges(): void {
        this.calcShapes();
    }

    calcShapes(basePan?: number): void {
        const canvas = this.canvas;
        const ratio = canvas.ratio;
        const x = this.pos.x * ratio;
        this.basePan = basePan ?? this.basePan;
        this.mShapes = [0, 1, 2].map(cycle => {
            const y = this.pos.y * ratio + this.basePan + cycle * canvas.fullHeight;
            return this.calcShape(x, y);
        });
    }

    hit(point: Point): boolean {
        for (const shape of this.shapes) {
            if (shape.distance(point) <= 0) return true;
        }
        return false;
    }

    calcShape(x: number, y: number): IShape {
        return null;
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
        this.shapes.forEach(shape => {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, 3 * scale, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }
}
