import {HttpClient} from "@angular/common/http";
import {first} from "rxjs/operators";
import {ObjectUtils} from "./object.utils";

declare const saveAs: any;

export class FileUtils {

    static getExtension(file: File): string {
        return file ? file.name.substr(file.name.lastIndexOf(".")).toLowerCase() : null;
    }

    static getName(file: File): string {
        return file ? file.name.substr(0, file.name.lastIndexOf(".")) : null;
    }

    static toFile(blob: Blob, fileName: string): File {
        const data: any = blob;
        data.lastModifiedDate = new Date();
        data.name = fileName.split(/\\|\//g).pop();
        return <File>data;
    }

    static dataToBlob(data: string): Blob {
        const parts = data.split(",");
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(":")[1].split(";")[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], {type: mimeString});
    }

    static saveBlob(blob: Blob, fileName: string): void {
        if (typeof saveAs == "undefined") {
            throw Error("FileSaver library is not loaded. Please load it: https://www.npmjs.com/package/file-saver");
        }
        saveAs(blob, fileName);
    }

    static saveJson(json: any, fileName: string): void {
        if (!ObjectUtils.isObject(json)) return;
        FileUtils.saveBlob(new Blob([JSON.stringify(json, null, 4)]), fileName);
    }

    static readFileAsText(file: Blob): Promise<string> {
        return FileUtils.readFile(
            // @dynamic
            reader => reader.readAsText(file)
        );
    }

    static readFileAsBinaryString(file: Blob): Promise<string> {
        return FileUtils.readFile(
            // @dynamic
            reader => reader.readAsBinaryString(file)
        );
    }

    static readFileAsDataURL(file: Blob): Promise<string> {
        return FileUtils.readFile(
            // @dynamic
            reader => reader.readAsDataURL(file)
        );
    }

    static readDataFromUrl(http: HttpClient, url: string): Promise<string> {
        return new Promise<string>(
            // @dynamic
            (resolve, reject) => {
                if (!url) {
                    reject({
                        message: "The url is not specified"
                    });
                    return;
                }
                if ((/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/g).test(url)) {
                    resolve(url);
                    return;
                }
                first()(http.get(url, {
                    responseType: "blob"
                })).subscribe((blob: Blob) => {
                    FileUtils.readFileAsDataURL(blob).then(resolve, reject);
                }, reason => {
                    if (reason.status > 0)
                        reject(reason);
                    else
                        resolve(url);
                });
            }
        );
    }

    private static readFile(callback: (reader: FileReader) => void): Promise<string> {
        return new Promise<string>(
            // @dynamic
            (resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event: any) => resolve(event.target.result);
                reader.onerror = reject;
                callback(reader);
            }
        );
    }
}
