import {ChangeDetectorRef, Directive, ElementRef, HostBinding, HostListener, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {ITimer} from "../common-types";
import {TimerUtils} from "../utils/timer.utils";
import {EventsService} from "../services/events.service";

@Directive({
    standalone: false,
    selector: "[sticky]"
})
export class StickyDirective implements OnInit, OnDestroy {

    @HostBinding("class.sticky") isSticky: boolean;
    @HostBinding("class.sticky-update") isUpdating: boolean;
    parentElement: HTMLElement;

    private updateTimer: ITimer;
    private eventForwarded: Subscription;

    constructor(private cdr: ChangeDetectorRef, private events: EventsService, private element: ElementRef) {
        this.parentElement = this.element.nativeElement.parentElement;
        this.updateTimer = TimerUtils.createTimeout(() => {
            this.isUpdating = false;
            this.cdr.detectChanges();
            this.events.updateSticky(this.isSticky);
        }, 10);
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
        this.cdr.detectChanges();
        this.updateTimer.run();
    }
}
