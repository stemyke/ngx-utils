import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {ObjectUtils} from "./object.utils";

declare const saveAs: any;

export class FileUtils {

    static readonly base64: RegExp = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/g;

    static getExtension(file: File): string {
        return file ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : null;
    }

    static getName(file: File): string {
        return file ? file.name.substring(0, file.name.lastIndexOf(".")) : null;
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

    static base64ToBlob(base64: string, mimeType = "application/octet-stream") {
        // Decode the Base64 string into a binary string
        const byteCharacters = atob(base64);

        // Convert the binary string into an array of bytes
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);

        // Create a Blob with the byte array and the specified MIME type
        return new Blob([byteArray], { type: mimeType });
    }

    static async readBlobFromUrl(http: HttpClient, url: string): Promise<Blob> {
        if (!url) {
            throw new Error(`The URL is not specified for readBlobFromUrl`);
        }
        if (url.match(FileUtils.base64)) {
            return FileUtils.base64ToBlob(url);
        }
        return firstValueFrom(http.get(url, {
            responseType: "blob"
        }));
    }

    static async readDataFromUrl(http: HttpClient, url: string): Promise<string> {
        if (!url) {
            throw new Error(`The URL is not specified for readBlobFromUrl`);
        }
        if (url.match(FileUtils.base64)) {
            return url;
        }
        const blob = await firstValueFrom(http.get(url, {
            responseType: "blob"
        }));
        return FileUtils.readFileAsDataURL(blob);
    }

    static getVideoCover(file: File, seekTo: number = null, quality: number = .75) {
        return new Promise<string>((resolve, reject) => {
            // load the file to a video player
            const videoPlayer = document.createElement("video");
            videoPlayer.setAttribute("src", URL.createObjectURL(file));
            videoPlayer.load();
            videoPlayer.addEventListener("error", (ex) => {
                reject("error when loading video file");
            });
            // load metadata of the video to get video duration and dimensions
            videoPlayer.addEventListener("loadedmetadata", () => {
                if (isNaN(seekTo)) {
                    seekTo = videoPlayer.duration / 2;
                }
                // seek to user defined timestamp (in seconds) if possible
                if (videoPlayer.duration < seekTo) {
                    reject("video is too short.");
                    return;
                }
                // delay seeking or else "seeked" event won"t fire on Safari
                setTimeout(() => {
                    videoPlayer.currentTime = seekTo;
                }, 200);
                // extract video thumbnail once seeking is complete
                videoPlayer.addEventListener("seeked", () => {
                    // define a canvas to have the same dimension as the video
                    const canvas = document.createElement("canvas");
                    canvas.width = videoPlayer.videoWidth;
                    canvas.height = videoPlayer.videoHeight;
                    // draw the video frame to canvas
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                    // return the canvas image as a blob
                    resolve(ctx.canvas.toDataURL(
                        "image/jpeg",
                        quality
                    ));
                });
            });
        });
    }

    static async getFilePreview(file: File): Promise<string> {
        const type = file.type.toLowerCase();
        if (type.startsWith("image/")) {
            return URL.createObjectURL(file);
        }
        if (type.startsWith("video/")) {
            return FileUtils.getVideoCover(file);
        }
        return null;
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
