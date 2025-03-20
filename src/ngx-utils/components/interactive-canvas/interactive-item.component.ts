import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from "@angular/core";
import {Subscription} from "rxjs";
import {
    CanvasItemDirection,
    CanvasItemShape,
    InteractiveCanvas,
    InteractiveCanvasItem,
    InteractivePanEvent, IPoint,
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

    protected cycles: number[];
    protected pos: Point;
    protected mShapes: IShape[];
    protected subscription: Subscription;

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
    set position(value: IPoint) {
        if (typeof value !== "object" || isNaN(value.x) || isNaN(value.y) || value === this.pos) return;
        this.pos = new Point(value.x, value.y);
    }

    @Input() rotation: number;
    @Input() direction: CanvasItemDirection;
    @Input() disabled: boolean;

    @Output() onClick: EventEmitter<InteractiveCanvasItem>;
    @Output() onPan: EventEmitter<InteractivePanEvent>;
    @Output() onPanStart: EventEmitter<InteractivePanEvent>;
    @Output() onPanEnd: EventEmitter<InteractivePanEvent>;

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
        this.cycles = [0];
        this.pos = Point.Zero;
        this.rotation = 0;
        this.direction = "none";
        this.mShapes = [];
        this.subscription = ObservableUtils.multiSubscription(
            this.onPan.subscribe(ev => {
                switch (this.direction) {
                    case "free":
                        this.x += ev.deltaX;
                        this.y += ev.deltaY;
                        break;
                    case "horizontal":
                        this.x += ev.deltaX;
                        break;
                    case "vertical":
                        this.y += ev.deltaY;
                        break;
                }
                if (this.direction !== "none") {
                    this.calcShapes();
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    ngOnChanges(): void {
        this.calcShapes();
    }

    calcShapes(cycles?: number[]): void {
        const canvas = this.canvas;
        const ratio = canvas.ratio;
        const x = this.pos.x * ratio;
        this.cycles = cycles ?? this.cycles;
        this.mShapes = this.cycles.map(pan => {
            const y = this.pos.y * ratio + pan;
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
