import {Pipe, PipeTransform} from "@angular/core";

export interface IGroupMap {
    [column: string]: any;
}

@Pipe({
    name: "groupBy"
})
export class GroupByPipe implements PipeTransform {

    transform(records: any[], column: string, map: IGroupMap = null): any {
        const groups = (records || []).reduce((result: any, item: any) => {
            const col = (map ? map[item[column] || ""] : item[column]) || "";
            const group: any[] = result[col] || [];
            group.push(item);
            result[col] = group;
            return result;
        }, {});
        return Object.keys(groups).map(k => {
            const result = {items: groups[k]};
            result[column] = k;
            return result;
        });
    }
}
