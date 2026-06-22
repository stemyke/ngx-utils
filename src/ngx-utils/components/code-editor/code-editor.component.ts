import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewEncapsulation,
    inject,
    input,
    model,
    signal,
    effect,
    viewChild,
    untracked
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { getRoot } from "../../utils/misc";
import { LoaderUtils } from "../../utils/loader.utils";
import { EDITOR_TYPES, ControlValueAccesFn } from "../../common-types";
import { isString } from "../../utils/object.utils";

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
        { provide: NG_VALUE_ACCESSOR, useExisting: CodeEditorComponent, multi: true }
    ],
})
export class CodeEditorComponent implements ControlValueAccessor, AfterViewInit {

    readonly value = model<string | Object>("");
    readonly lang = input<string>("json");
    readonly disabled = model<boolean>(false);

    protected onChange: ControlValueAccesFn<string | Object> = () => { };
    protected onTouched: ControlValueAccesFn = () => { };

    protected readonly cdr = inject(ChangeDetectorRef);
    protected readonly element = inject(ElementRef<HTMLElement>);

    protected langCompartment: CodeEditorCompartment;
    protected editableCompartment: CodeEditorCompartment;
    protected extensions: Record<string, Object> = {};
    protected rootElem: DocumentOrShadowRoot;
    protected readonly editor = signal<CodeEditorView | null>(null);

    protected readonly editorElem = viewChild<ElementRef<HTMLDivElement>>("editor");

    get root(): DocumentOrShadowRoot {
        this.rootElem = this.rootElem || getRoot(this.element.nativeElement);
        return this.rootElem;
    }

    get rootNode(): Node {
        return this.root as any;
    }

    constructor() {
        effect(() => {
            const editor = this.editor();
            if (!editor) return;

            const value = this.value() || "";
            const disabled = this.disabled();

            const expectedStr = !isString(value) ? JSON.stringify(value, null, 4) : value;
            const currentStr = editor.state.doc.toString();

            const langExtension = this.getLangExtension();
            const { EditorView } = CM["@codemirror/view"];
            const dispatchData: any = {
                effects: [
                    this.langCompartment.reconfigure(langExtension),
                    this.editableCompartment.reconfigure(EditorView.editable.of(!disabled))
                ]
            };

            if (currentStr !== expectedStr) {
                dispatchData.changes = {
                    from: 0,
                    to: editor.state.doc.length,
                    insert: expectedStr
                };
            }

            editor.dispatch(dispatchData);
        });
    }

    getLangExtension(): Object {
        const langVal = this.lang();
        if (!this.extensions[langVal]) {
            const lang = CM[`@codemirror/lang-${langVal || "json"}`];
            const ext = lang[langVal] as CodeMirrorExtension;
            this.extensions[langVal] = ext();
        }
        return this.extensions[langVal];
    }

    ngAfterViewInit(): void {
        Promise.all([
            LoaderUtils.loadScript("https://codemirror.net/codemirror.js", true),
            LoaderUtils.loadScript("https://cdn.jsdelivr.net/npm/jsonlint", true),
        ]).then(() => this.initEditor());
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    writeValue(value: string) {
        this.value.set(value);
        this.cdr.markForCheck();
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled.set(isDisabled);
    }

    protected initEditor(): void {
        untracked(() => {
            const { basicSetup } = CM["codemirror"];
            const { Compartment } = CM["@codemirror/state"];
            const { EditorView } = CM["@codemirror/view"];
            const { linter } = CM["@codemirror/lint"];
            const langExtension = this.getLangExtension();

            const jsonLinter = linter((view: CodeEditorView) => {
                const diagnostics: any[] = [];
                const value = view.state.doc.toString();

                if (!value.trim() || this.lang() !== "json") return diagnostics;

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
                    const lang = untracked(() => this.lang());
                    let parsedValue: any;
                    if (lang === "json") {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        parsedValue = value;
                    }
                    this.value.set(parsedValue);
                    this.onChange(parsedValue);
                    this.onTouched(parsedValue);
                }
            });

            // Initialize editor on an HTMLElement
            const value = this.value() || "";
            const disabled = this.disabled();

            this.langCompartment = new Compartment();
            this.editableCompartment = new Compartment();
            this.editor.set(new EditorView({
                doc: !isString(value) ? JSON.stringify(value, null, 4) : value,
                extensions: [
                    basicSetup,
                    this.langCompartment.of(langExtension),
                    this.editableCompartment.of(EditorView.editable.of(!disabled)),
                    EditorView.lineWrapping,
                    jsonLinter,
                    changeHandler
                ],
                parent: this.editorElem()?.nativeElement
            }));
        });
    }
}
