import {Directive, ElementRef, HostBinding, HostListener, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {EventsService} from "../services";
import {ITimer, TimerUtils} from "../utils";

@Directive({
    selector: "[sticky]"
})
export class StickyDirective implements OnInit, OnDestroy {

    @HostBinding("class.sticky") isSticky: boolean;
    @HostBinding("class.sticky-update") isUpdating: boolean;
    parentElement: HTMLElement;

    private updateTimer: ITimer;
    private eventForwarded: Subscription;

    constructor(private events: EventsService, private element: ElementRef) {
        this.parentElement = this.element.nativeElement.parentElement;
        this.updateTimer = TimerUtils.createTimeout();
    }

    ngOnInit(): void {
        this.eventForwarded = this.events.eventForwarded.subscribe((e: Event) => {
            if (e && e.type === "scroll") this.updateSticky();
        });
    }

    ngOnDestroy(): void {
        this.eventForwarded.unsubscribe();
    }

    @HostListener("window:resize")
    @HostListener("window:scroll")
    updateSticky(): void {
        const distanceToTop = this.parentElement.getBoundingClientRect().top;
        this.isSticky = distanceToTop < 1;
        this.isUpdating = true;
        this.updateTimer.clear();
        this.updateTimer.set(() => this.isUpdating = false, 10);
    }
}
