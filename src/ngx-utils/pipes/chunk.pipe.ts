import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "chunk"
})
export class ChunkPipe implements PipeTransform {
    transform(items: any[], count: number): any[] {
        const result: any[] = [];
        let subResult: any[] = null;
        items.forEach((item, index) => {
            if (index % count == 0) {
                subResult = [];
                result.push(subResult);
            }
            subResult.push(item);
        });
        return result;
    }
}
