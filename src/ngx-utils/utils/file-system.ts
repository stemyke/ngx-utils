import {ObjectUtils} from "./object.utils";

export type FileSystemEntryOpenResult<D = any, R = any> = Promise<readonly FileSystemEntry<D, R>[]>;

export type FileSystemEntryOpenCb<PD, D = any, R = any> = (parent: FileSystemEntry<PD>) => FileSystemEntryOpenResult<D, R>;

export class FileSystemEntry<D = any, R = any> {

    protected result: FileSystemEntryOpenResult;

    readonly path: ReadonlyArray<FileSystemEntry>;
    readonly level: number;
    readonly classes: ReadonlyArray<string>;

    get parent(): FileSystemEntry {
        return this.level === 0 ? null : this.path[this.level - 1] || null;
    }

    constructor(readonly label: string,
                readonly meta: string,
                readonly image: string,
                readonly data: D,
                protected openCb: FileSystemEntryOpenCb<D, R>,
                parent: FileSystemEntry = null,
                classes?: string[]) {
        this.path = !parent ? [this] : parent.path.concat([this]);
        this.level = this.path.length - 1;
        this.classes = [`level-${this.level}`].concat(classes ?? this.path
            .map(t => {
                if (ObjectUtils.isString(t.data)) {
                    return t.data;
                }
                if (ObjectUtils.isObject(t.data)) {
                    const list = Object.keys(t.data).map(k => {
                        const value = t.data[k];
                        return ObjectUtils.isString(value) && value.length > 0 && value.length < 50
                            ? `${k}-${value}`
                            : null;
                    });
                    return list.filter(i => !!i).join(" ");
                }
                return null;
            }).filter(t => !!t));
    }

    open<O = any>(): FileSystemEntryOpenResult<R, O> {
        this.result = this.result || this.openCb(this);
        this.result.then(res => {
            if (Array.isArray(res)) return;
            this.result = null;
        });
        return this.result;
    }
}
