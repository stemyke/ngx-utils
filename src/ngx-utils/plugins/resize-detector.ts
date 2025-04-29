import elementResizeDetectorMaker from "element-resize-detector";
import type {Erd} from "element-resize-detector";
import {ResizeEventStrategy} from "../common-types";

export class ResizeDetector {

    protected readonly detector: Erd;
    protected isObservable: boolean;
    protected observers: Map<HTMLElement, ResizeObserver>;

    constructor(protected resizeStrategy: ResizeEventStrategy) {
        this.detector = elementResizeDetectorMaker({
            strategy: resizeStrategy === "observer" ? "object" : resizeStrategy
        });
        this.isObservable = resizeStrategy === "observer" && typeof ResizeObserver === "function";
        this.observers = new Map();
    }

    listenTo(elem: HTMLElement, cb: (el: HTMLElement) => void): void {
        if (!this.isObservable) {
            this.detector.listenTo(elem, cb);
            return;
        }
        if (this.observers.has(elem)) return;
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                cb(elem);
            });
        });
        observer.observe(elem);
        this.observers.set(elem, observer);
    }

    uninstall(elem: HTMLElement): void {
        if (!this.isObservable) {
            this.detector.uninstall(elem);
            return;
        }
        if (!this.observers.has(elem)) return;
        const observer = this.observers.get(elem);
        observer.unobserve(elem);
        this.observers.delete(elem);
    }
}
