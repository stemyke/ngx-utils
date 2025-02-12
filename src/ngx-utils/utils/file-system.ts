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
                parent: FileSystemEntry = null) {
        this.path = !parent ? [this] : parent.path.concat([this]);
        this.level = this.path.length - 1;
        this.classes = this.path
            .filter(t => typeof t.data === "string" && t.data.length > 0).map(t => t.data)
            .concat([`level-${this.level}`]);
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
