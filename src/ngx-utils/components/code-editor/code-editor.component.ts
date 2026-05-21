import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import {getRoot} from "../../utils/misc";
import {LoaderUtils} from "../../utils/loader.utils";
import {EDITOR_TYPES} from "../../common-types";
import {isString} from "../../utils/object.utils";

type CodeMirrorExtension = () => Object;

interface CodeEditorView {
    readonly value: string;
    readonly state: Record<string, any>;
    dispatch(changes: Record<string, any>): void;
}

interface CodeEditorCompartment {
    of(ext: Object): Object;
    reconfigure(ext: Object): Object[];
}

interface JsonLexerLocation {
    readonly first_column: number;
    readonly first_line: number;
    readonly last_column: number;
    readonly last_line: number;
}

interface JsonLexer {
    readonly yyleng: number;
    readonly yylloc: JsonLexerLocation;
    readonly match: string;
    readonly matched: string;
}

declare const CM: Record<string, any>;

declare const jsonlint: {
    readonly str: string;
    readonly lexer: JsonLexer;
    parse(value: string): any;
};

@Component({
    standalone: false,
    selector: "code-editor",
    styleUrls: ["./code-editor.component.scss"],
    templateUrl: "./code-editor.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: CodeEditorComponent, multi: true}
    ],
})
export class CodeEditorComponent implements ControlValueAccessor, OnChanges, AfterViewInit {

    @Input() value: string | Object;
    @Input() lang: string;
    @Input() disabled: boolean;
    @Output() valueChange: EventEmitter<string>;

    onChange: Function;
    onTouched: Function;

    protected langCompartment: CodeEditorCompartment;
    protected extensions: Record<string, Object>;
    protected rootElem: DocumentOrShadowRoot;
    protected editor: CodeEditorView;

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
        this.lang = "json";
        this.onChange = () => {
        };
        this.onTouched = () => {
        };
        this.extensions = {};
    }

    getLangExtension(): Object {
        if (!this.extensions[this.lang]) {
            const lang = CM[`@codemirror/lang-${this.lang || "json"}`];
            const ext = lang[this.lang] as CodeMirrorExtension;
            this.extensions[this.lang] = ext();
        }
        return this.extensions[this.lang];
    }

    ngAfterViewInit(): void {
        Promise.all([
            LoaderUtils.loadScript("https://codemirror.net/codemirror.js", true),
            LoaderUtils.loadScript("https://cdn.jsdelivr.net/npm/jsonlint", true),
        ]).then(() => {

            const {basicSetup} = CM["codemirror"];
            const {Compartment} = CM["@codemirror/state"];
            const {EditorView} = CM["@codemirror/view"];
            const {linter} = CM["@codemirror/lint"];
            const langExtension = this.getLangExtension();

            const jsonLinter = linter((view: CodeEditorView) => {
                const diagnostics: any[] = [];
                const value = view.state.doc.toString();

                if (!value.trim() || this.lang !== "json") return diagnostics;

                try {
                    jsonlint.parse(value);
                } catch (error) {
                    const lexer = jsonlint.lexer;
                    const location = lexer.yylloc;
                    const pos = Number(lexer.matched?.length ?? 0);
                    diagnostics.push({
                        from: pos - lexer.yyleng,
                        to: pos,
                        severity: "error",
                        message: error.message || `Parse error at line ${location.first_line} column ${location.first_column}, unexpected: "${lexer.match}"`
                    });
                }

                return diagnostics; // The editor reruns this automatically on user text updates
            });

            const changeHandler = EditorView.updateListener.of((update: any) => {
                // This fires on EVERY change (keystrokes, selection shifts, focus tweaks)
                if (update.docChanged) {
                    // Grab the full string payload of the document
                    const value = update.state.doc.toString();
                    if (this.lang === "json") {
                        try {
                            this.value = JSON.parse(value);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        this.value = value;
                    }
                    this.onChange(this.value);
                    this.onTouched(this.value);
                }
            });

            // Initialize editor on an HTMLElement
            const value = this.value || "";
            this.langCompartment = new Compartment();
            this.editor = new EditorView({
                doc: !isString(value) ? JSON.stringify(value, null, 4) : value,
                extensions: [
                    basicSetup,
                    this.langCompartment.of(langExtension),
                    jsonLinter,
                    changeHandler
                ],
                parent: this.editorElem.nativeElement
            });
        });
    }

    ngOnChanges(): void {
        if (!this.editor) return;
        const value = this.value || "";
        this.lang = EDITOR_TYPES.includes(this.lang) ? this.lang : "json";
        this.editor.dispatch({
            effects: this.langCompartment.reconfigure(this.getLangExtension()),
            changes: {
                from: 0,
                to: this.editor.state.doc.length,
                insert: !isString(value) ? JSON.stringify(value, null, 4) : value
            }
        });
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
