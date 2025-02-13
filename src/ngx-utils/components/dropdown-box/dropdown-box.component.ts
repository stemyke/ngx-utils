import {AfterViewInit, Component, Input, OnChanges, ViewChild, ViewEncapsulation} from "@angular/core";
import {Placement} from "@floating-ui/utils";
import {Alignment, AutoPlacementOptions} from "@floating-ui/dom";
import {DropdownContentDirective} from "../../directives/dropdown-content.directive";

@Component({
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    selector: "dropdown-box",
    styleUrls: ["./dropdown-box.component.scss"],
    templateUrl: "./dropdown-box.component.html",
})
export class DropdownBoxComponent implements AfterViewInit, OnChanges {

    /**
     * Determines if the dropdown should be closed even if we click inside it
     */
    @Input() closeInside: boolean;

    /**
     * Determines if the floating element needs to be placed in the root node or keep where it was before
     */
    @Input() attachToRoot: boolean;

    /**
     * Where to place the floating element relative to the reference element.
     */
    @Input() placement: Placement;

    /**
     * The axis that runs along the alignment of the floating element. Determines
     * whether to check for most space along this axis.
     * @default false
     */
    @Input() crossAxis?: boolean;

    /**
     * Choose placements with a particular alignment.
     * @default undefined
     */
    @Input() alignment?: Alignment | null;

    /**
     * Whether to choose placements with the opposite alignment if the preferred
     * alignment does not fit.
     * @default true
     */
    @Input() autoAlignment?: boolean;

    /**
     * Which placements are allowed to be chosen. Placements must be within the
     * `alignment` option if explicitly set.
     * @default allPlacements (variable)
     */
    @Input() allowedPlacements?: Array<Placement>;

    /**
     * Adds a class to the main div element and also to the content
     * ('drop' by default which translates to 'drop-content-wrapper' in case of content)
     */
    @Input() componentClass: string;

    autoPlacement: AutoPlacementOptions;

    @ViewChild(DropdownContentDirective)
    content: DropdownContentDirective;

    constructor() {
        this.closeInside = true;
        this.attachToRoot = true;
        this.placement = "bottom";
        this.crossAxis = false;
        this.autoAlignment = true;
        this.allowedPlacements = ["top", "bottom"];
        this.componentClass = "drop";
        this.makeAutoPlacementOpts();
    }

    protected makeAutoPlacementOpts() {
        this.autoPlacement = {
            crossAxis: this.crossAxis,
            alignment: this.alignment,
            autoAlignment: this.autoAlignment,
            allowedPlacements: this.allowedPlacements,
        };
    }

    ngAfterViewInit() {
        this.content.initialize();
    }

    ngOnChanges() {
        this.makeAutoPlacementOpts();
    }
}
