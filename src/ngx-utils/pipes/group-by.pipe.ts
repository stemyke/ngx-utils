import {Pipe, PipeTransform} from "@angular/core";
import {ObjectUtils} from "../utils/object.utils";

export interface IGroupMap {
    [column: string]: any;
}

@Pipe({
    name: "groupBy"
})
export class GroupByPipe implements PipeTransform {

    transform(records: any[], column: string, map: IGroupMap = null): any {
        const groups = (records || []).reduce((result: any, item: any) => {
            const key = ObjectUtils.getValue(item, column) || "";
            const col = map ? (map[key] || "") : key;
            const group: any[] = result[col] || [];
            group.push(item);
            result[col] = group;
            return result;
        }, {});
        return Object.keys(groups).map(key => {
            return {group: key, items: groups[key]};
        });
    }
}
