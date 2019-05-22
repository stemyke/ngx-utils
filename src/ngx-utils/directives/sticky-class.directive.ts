import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {Subscription} from "rxjs";
import {EventsService} from "../services/events.service";

@Directive({
    selector: "[stickyClass]"
})
export class StickyClassDirective implements OnInit, OnDestroy {

    @Input() stickyClass: string;

    private stickyUpdated: Subscription;

    constructor(private events: EventsService, private element: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit(): void {
        this.stickyUpdated = this.events.stickyUpdated.subscribe(() => {
            if (this.events.isSticky) {
                this.renderer.addClass(this.element.nativeElement, this.stickyClass || "sticky-sibling");
                return;
            }
            this.renderer.removeClass(this.element.nativeElement, this.stickyClass || "sticky-sibling");
        });
    }

    ngOnDestroy(): void {
        this.stickyUpdated.unsubscribe();
    }
}
