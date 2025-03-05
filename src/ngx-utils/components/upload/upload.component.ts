import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnChanges,
    Output,
    TemplateRef,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HttpErrorResponse, HttpEventType, HttpResponse} from "@angular/common/http";
import {lastValueFrom} from "rxjs";

import {
    API_SERVICE,
    IApiService,
    IFileUploadProcess,
    IFileUploadResult,
    IToasterService,
    TOASTER_SERVICE,
    UploadType
} from "../../common-types";
import {ArrayUtils} from "../../utils/array.utils";
import {ObjectUtils} from "../../utils/object.utils";
import {FileUtils} from "../../utils/file.utils";
import {BaseHttpClient} from "../../services/base-http.client";

@Component({
    standalone: false,
    selector: "upload",
    styleUrls: ["./upload.component.scss"],
    templateUrl: "./upload.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => UploadComponent),
        multi: true,
    }],
})
export class UploadComponent implements ControlValueAccessor, OnChanges {

    @Input() value: UploadType | UploadType[];
    @Input() disabled: boolean;
    @Input() inline: boolean;
    @Input() accept: string | string[];
    @Input() baseUrl: string;
    @Input() message: string;
    @Input() multiple: boolean;
    @Input() buttonText: string;
    @Input() makeUpload: (f: File) => any;
    @Input() preProcess: (f: File) => boolean;
    @Output() onUploaded: EventEmitter<IFileUploadResult[]>;
    @Output() onRemove: EventEmitter<UploadType[]>;

    acceptAttr: string;
    isImage: boolean;
    dropAllowed: boolean;
    processing: IFileUploadProcess[];

    onChange: Function;
    onTouched: Function;
    remove: (index?: number) => void;

    @ContentChild("uploadButton")
    uploadButton: TemplateRef<any>;

    protected fileImageCache: Map<Blob, string>;
    protected acceptTypes: string[];

    get http(): BaseHttpClient {
        return this.api.client as BaseHttpClient;
    }

    constructor(
        private cdr: ChangeDetectorRef,
        @Inject(API_SERVICE) private api: IApiService,
        @Inject(TOASTER_SERVICE) private toaster: IToasterService
    ) {
        this.value = null;
        this.disabled = false;
        this.inline = false;
        this.fileImageCache = new Map();
        this.buttonText = "button.select-files";
        this.onUploaded = new EventEmitter();
        this.onRemove = new EventEmitter();
        this.onChange = () => {
        };
        this.onTouched = () => {
        };
        this.remove = index => {
            if (this.multiple) {
                const current = Array.from((this.value as UploadType[]) || []);
                current.splice(index, 1);
                this.writeValue(current);
                this.onRemove.emit(current);
            }
            this.writeValue(null);
            this.onRemove.emit([]);
        };
    }

    onDragEnter(ev: DragEvent): void {
        const types = Array.from(ev.dataTransfer.items || [])
            .filter(t => t.kind == "file")
            .map(t => t.type.toLowerCase());
        types.push(...Array.from(ev.dataTransfer.files || []).map(f => f.type.toLowerCase()));
        if (!types.some(type => ArrayUtils.has(this.acceptTypes, type))) {
            ev.preventDefault();
            return;
        }
        ev.dataTransfer.effectAllowed = "copy";
        ev.dataTransfer.dropEffect = "copy";
        this.dropAllowed = true;
    }

    onDrop(): void {
        this.dropAllowed = false;
    }

    ngOnChanges(): void {
        this.accept = this.accept || "";
        this.acceptAttr = ObjectUtils.isString(this.accept) ? this.accept : this.accept.join(",");
        this.acceptTypes = ObjectUtils.isString(this.accept) && this.accept.length > 0
            ? this.accept.toLowerCase().split(",")
            : (ObjectUtils.isArray(this.accept) ? this.accept : []);
        this.isImage = /(png|jpg|jpeg|webp|gif)/gi.test(this.acceptAttr);
        this.cdr.markForCheck();
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    writeValue(value: UploadType | UploadType[]) {
        this.value = value;
        this.cdr.markForCheck();
        this.onChange(this.value);
        this.onTouched(this.value);
    }

    setDisabledState(val: boolean) {
        this.disabled = val === true;
        this.cdr.markForCheck();
    }

    onInputClick(ev: MouseEvent): void {
        const top = document.elementFromPoint(ev.clientX, ev.clientY);
        if (ev.target !== top && !this.processing) return;
        ev.preventDefault();
    }

    onInputChange(ev: Event): void {
        const input = ev.currentTarget as HTMLInputElement;
        if (this.processing) {
            input.value = "";
            return;
        }
        const length = input.files.length;
        if (length == 0) {
            this.writeValue(this.multiple ? [] : null);
            return;
        }
        const files: File[] = [];
        for (let i = 0; i <length; i++) {
            const file = input.files.item(i);
            if (this.acceptTypes.length == 0) {
                files.push(file);
                continue;
            }
            const type = file.type.toLowerCase();
            const ext = FileUtils.getExtension(file);
            if (!ArrayUtils.has(this.acceptTypes, type, ext)) continue;
            files.push(file);
        }
        if (files.length == 0) {
            this.toaster.error("message.invalid-files.error");
            return;
        }
        this.processFiles(this.multiple ? files : files.slice(0, 1)).then(results => {
            const ids = results.map(t => t.file || t._id || t.id);
            this.writeValue(this.multiple ? ids : (ids[0] || null));
            this.onUploaded.emit(results);
        });
        input.value = "";
    }

    getUrl(image: any): string {
        if (ObjectUtils.isBlob(image)) {
            if (!this.fileImageCache.has(image)) {
                this.fileImageCache.set(image, URL.createObjectURL(image));
            }
            return this.fileImageCache.get(image);
        }
        const url = !image ? null : image.imageUrl || image;
        if (!ObjectUtils.isString(url)) return null;
        if (url.startsWith("data:")) return url;
        const baseUrl = this.baseUrl;
        const query = this.isImage ? `?type=preview` : ``;
        if (!baseUrl) {
            return `${url}${query}`;
        }
        return `${baseUrl}/${url}${query}`;
    }

    getBgUrl(image: any): string {
        return `url('${this.getUrl(image)}')`;
    }

    async processFiles(files: File[]): Promise<IFileUploadResult[]> {
        if (this.processing) return null;
        const headers = this.http.makeHeaders();
        const makeUpload = ObjectUtils.isFunction(this.makeUpload) ? this.makeUpload : f => {
            const form = new FormData();
            form.append("file", f);
            return form;
        };
        const preProcess = ObjectUtils.isFunction(this.preProcess) ? this.preProcess : () => {
            return false;
        };
        this.processing = files.filter(f => !preProcess(f)).map(file => {
            const process: IFileUploadProcess = {
                file,
                progress: 0
            };
            process.promise = FileUtils.getFilePreview(file).then(preview => {
                process.preview = `url('${preview}')`;
                this.fileImageCache.set(file, preview);
                this.cdr.detectChanges();
            });
            return process;
        });
        const baseUrl = this.baseUrl || this.api.url("assets");
        const requests = this.processing.map(async (p): Promise<IFileUploadResult> => {
            await p.promise;
            if (this.inline) {
                return {
                    filename: p.file?.name,
                    file: p.file,
                };
            }
            const request = this.http.post(baseUrl, makeUpload(p.file), {
                headers, observe: "events", reportProgress: true
            });
            request.subscribe(value => {
                if (value.type === HttpEventType.UploadProgress) {
                    p.progress = Math.round(value.loaded / value.total * 100);
                    this.cdr.detectChanges();
                }
            });
            return lastValueFrom(request)
                .then((res: HttpResponse<any>) => {
                    const body = res.body;
                    if (!ObjectUtils.isObject(body)) {
                        return {id: body};
                    }
                    return body;
                }, (e: HttpErrorResponse) => {
                    this.toaster.error(e.error?.message || e.message || `Can"t upload file: ${p.file.name}`);
                    return null;
                });
        });
        const results = await Promise.all(requests);
        this.processing = null;
        this.cdr.detectChanges();
        return results.filter(r => r !== null);
    }
}
