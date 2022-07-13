export type FileSystemEntryOpenResult = ReadonlyArray<FileSystemEntry> | null;

export type FileSystemEntryOpenCb = (data: any, parent: FileSystemEntry) => Promise<FileSystemEntryOpenResult>;

export class FileSystemEntry {

    protected result: Promise<FileSystemEntryOpenResult>;

    readonly path: ReadonlyArray<FileSystemEntry>;
    readonly level: number;
    readonly classes: ReadonlyArray<string>;

    constructor(readonly label: string,
                readonly meta: string,
                readonly image: string,
                readonly data: any,
                readonly parent: FileSystemEntry,
                protected openCb: FileSystemEntryOpenCb) {
        this.path = !parent ? [this] : parent.path.concat([this]);
        this.level = this.path.length - 1;
        this.classes = this.path
            .filter(t => typeof t.data === "string" && t.data.length > 0).map(t => t.data)
            .concat([`level-${this.level}`]);
    }

    open(): Promise<FileSystemEntryOpenResult> {
        this.result = this.result || this.openCb(this.data, this);
        return this.result;
    }
}
