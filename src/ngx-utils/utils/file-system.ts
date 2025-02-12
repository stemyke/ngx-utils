export type FileSystemEntryOpenResult<T = any> = ReadonlyArray<FileSystemEntry<T>> | null;

export type FileSystemEntryOpenCb = (data: any, parent: FileSystemEntry) => Promise<FileSystemEntryOpenResult>;

export class FileSystemEntry<T = any, R = any> {

    protected result: Promise<FileSystemEntryOpenResult>;

    readonly path: ReadonlyArray<FileSystemEntry>;
    readonly level: number;
    readonly classes: ReadonlyArray<string>;

    constructor(readonly label: string,
                readonly meta: string,
                readonly image: string,
                readonly data: T,
                readonly parent: FileSystemEntry,
                protected openCb: FileSystemEntryOpenCb) {
        this.path = !parent ? [this] : parent.path.concat([this]);
        this.level = this.path.length - 1;
        this.classes = this.path
            .filter(t => typeof t.data === "string" && t.data.length > 0).map(t => t.data)
            .concat([`level-${this.level}`]);
    }

    open<O = R>(): Promise<FileSystemEntryOpenResult<O>> {
        this.result = this.result || this.openCb(this.data, this);
        this.result.then(res => {
            if (Array.isArray(res)) return;
            this.result = null;
        });
        return this.result;
    }
}
