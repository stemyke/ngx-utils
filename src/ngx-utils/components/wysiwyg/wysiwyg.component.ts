import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input, OnChanges,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {getRoot} from "../../utils/misc";
import {LoaderUtils} from "../../utils/loader.utils";

interface Pell {
    content: HTMLElement;
}

declare const pell: {init: (config: Record<string, unknown>) => Pell};

@Component({
    standalone: false,
    selector: "wysiwyg",
    styleUrls: ["./wysiwyg.component.scss"],
    templateUrl: "./wysiwyg.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: WysiwygComponent, multi: true}
    ],
})
export class WysiwygComponent implements ControlValueAccessor, OnChanges, AfterViewInit {

    @Input() value: string;
    @Input() disabled: boolean;
    @Output() valueChange: EventEmitter<string>;

    onChange: Function;
    onTouched: Function;

    protected rootElem: DocumentOrShadowRoot;
    protected editor: Pell;

    @ViewChild("editor")
    protected editorElem: ElementRef<HTMLDivElement>;

    get root(): DocumentOrShadowRoot {
        this.rootElem = this.rootElem || getRoot(this.element.nativeElement);
        return this.rootElem;
    }

    get rootNode(): Node {
        return this.root as any;
    }

    constructor(
        readonly cdr: ChangeDetectorRef,
        readonly element: ElementRef<HTMLElement>
    ) {
        this.value = "";
        this.onChange = () => {
        };
        this.onTouched = () => {
        };
    }

    ngAfterViewInit(): void {
        Promise.all([
            LoaderUtils.loadScript("https://unpkg.com/pell"),
            LoaderUtils.loadStyle("https://unpkg.com/pell/dist/pell.min.css", this.rootNode)
        ]).then(() => {
            // Initialize pell on an HTMLElement
            this.editor = pell.init({
                // <HTMLElement>, required
                element: this.editorElem.nativeElement,

                // <Function>, required
                // Use the output html, triggered by element's `oninput` event
                onChange: (html: string) => {
                    this.value = html;
                    this.onChange(this.value);
                    this.onTouched(this.value);
                },

                defaultParagraphSeparator: "p",
                actions: [
                    "bold",
                    "italic",
                    "underline"
                ],
            });
            this.editor.content.innerHTML = this.value || "";
        });
    }

    ngOnChanges(): void {
        if (!this.editor) return;
        this.editor.content.innerHTML = this.value || "";
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    writeValue(value: string) {
        this.value = value;
        this.cdr.markForCheck();
        this.ngOnChanges();
    }
}
