import {KeyValue} from "@angular/common";

export type DragHandlerEvents = "dragstart" | "dragenter" | "dragleave" | "drop";
export type DragEventListener = (ev: DragEvent) => boolean | void;

export class DragDropHandler {

    protected static handlers: Map<HTMLElement, DragDropHandler>;

    protected readonly onDragStart: DragEventListener;
    protected readonly onDragEnter: DragEventListener;
    protected readonly onDragOver: DragEventListener;
    protected readonly onDragLeave: DragEventListener;
    protected readonly onDrop: DragEventListener;

    protected first: boolean;
    protected second: boolean;
    protected dropEffect: "none" | "copy" | "link" | "move";
    protected effectAllowed: "none" | "copy" | "copyLink" | "copyMove" | "link" | "linkMove" | "move" | "all" | "uninitialized";
    protected listeners: Array<KeyValue<DragHandlerEvents, DragEventListener>>;

    static get(el: HTMLElement) {
        if (DragDropHandler.handlers?.has(el)) {
            return DragDropHandler.handlers.get(el);
        }
        return new DragDropHandler(el);
    }

    protected static add(el: HTMLElement, inst: DragDropHandler) {
        DragDropHandler.handlers = DragDropHandler.handlers || new Map();
        DragDropHandler.handlers.set(el, inst);
    }

    protected constructor(protected el: HTMLElement) {
        this.first = false;
        this.second = false;
        this.listeners = [];
        this.onDragStart = ev => {
            this.fireEvent("dragstart", ev);
            this.effectAllowed = ev.dataTransfer.effectAllowed;
            this.dropEffect = ev.dataTransfer.dropEffect;
        };
        this.onDragEnter = ev => {
            ev.preventDefault();
            if (this.first) {
                this.second = true;
            } else {
                this.first = true;
                this.fireEvent("dragenter", ev);
                this.effectAllowed = ev.dataTransfer.effectAllowed;
                this.dropEffect = ev.dataTransfer.dropEffect;
            }
        };
        this.onDragOver = ev => {
            ev.preventDefault();
            ev.dataTransfer.effectAllowed = this.effectAllowed;
            ev.dataTransfer.dropEffect = this.dropEffect;
        };
        this.onDragLeave = ev => {
            if (this.second) {
                this.second = false
            } else if (this.first) {
                this.first = false
            }
            if (!this.first && !this.second) {
                this.fireEvent("dragleave", ev);
            }
        };
        this.onDrop = ev => {
            ev.preventDefault();
            this.first = false;
            this.second = false;
            this.fireEvent("drop", ev);
        };
        this.el.addEventListener("dragstart", this.onDragStart);
        this.el.addEventListener("dragenter", this.onDragEnter);
        this.el.addEventListener("dragover", this.onDragOver);
        this.el.addEventListener("dragleave", this.onDragLeave);
        this.el.addEventListener("drop", this.onDrop);
        DragDropHandler.add(this.el, this);
    }

    addListener(key: DragHandlerEvents, value: DragEventListener): void {
        this.listeners = [
            ...this.listeners,
            {key, value}
        ];
    }

    removeListener(type: DragHandlerEvents, listener: DragEventListener): void {
        this.listeners = this.listeners.filter(entry => entry.key !== type || entry.value !== listener);
        if (this.listeners.length > 0) return;
        this.destroy();
    }

    protected fireEvent(type: DragHandlerEvents, ev: DragEvent): void {
        this.listeners.forEach(entry => {
            if (entry.key !== type) return;
            entry.value(ev);
        });
    }

    protected destroy(): void {
        this.el.removeEventListener("dragstart", this.onDragStart);
        this.el.removeEventListener("dragenter", this.onDragEnter);
        this.el.removeEventListener("dragover", this.onDragOver);
        this.el.removeEventListener("dragleave", this.onDragLeave);
        this.el.removeEventListener("drop", this.onDrop);
        DragDropHandler.handlers?.delete(this.el);
    }
}
