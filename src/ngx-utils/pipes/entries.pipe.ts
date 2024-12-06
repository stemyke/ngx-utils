import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export interface IEntry {
    key: string;
    value: any;
    index: number;
}

const emptyEntries: IEntry[] = [];

@Pipe({
    standalone: false,
    name: "entries"
})
export class EntriesPipe implements PipeTransform {

    transform(value: any): IEntry[] {
        if (!value) return emptyEntries;
        const entries: IEntry[] = [];
        ObjectUtils.iterate(value, (val, key) => {
            entries.push({
                key: key,
                value: val,
                index: entries.length
            });
        });
        return entries;
    }
}
