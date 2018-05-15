import {ObjectUtils} from "./object.utils";

export class SetUtils {
    static equals(set: Set<any>, obj: any): boolean {
        if (!ObjectUtils.isSet(set) || !ObjectUtils.isSet(obj))
            return false;
        if (set.size != obj.size)
            return false;
        for (const item of set) {
            if (!obj.has(item)) return false;
        }
        return true;
    }

    static addArray(set: Set<any>, items: any[]): void {
        if (!ObjectUtils.isSet(set) || !ObjectUtils.isArray(items)) return;
        items.forEach(i => set.add(i));
    }
}
