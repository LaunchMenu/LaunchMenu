import {IIdentifiedItem} from "../_types/IIdentifiedItem";

/**
 * Retrieves the changes between two stacks of items. Items are only allowed to be removed or added, not switch places (swaps are ignored)
 * @param oldItems The previous item list
 * @param newItems The new item list
 * @returns The added and removed items lists
 */
export function findStackChanges<D extends IIdentifiedItem<any>>(
    oldItems: readonly D[],
    newItems: readonly D[]
): {
    added: {index: number; item: D}[];
    removed: {index: number; item: D}[];
    updated: {
        /** new index */ index: number;
        oldItem: D;
        newItem: D;
    }[];
} {
    // Check ids in old and new group
    const oldIds: {[key: string]: D} = {};
    const newIds: {[key: string]: boolean} = {};
    oldItems.forEach(item => (oldIds[item.ID] = item));
    newItems.forEach(({ID}) => (newIds[ID] = true));

    // Check whether all ids are present and add to added or removed otherwise
    const removed: {index: number; item: D}[] = [];
    const added: {index: number; item: D}[] = [];
    const updated: {index: number; oldItem: D; newItem: D}[] = [];
    oldItems.forEach((item, i) => {
        if (!newIds[item.ID]) removed.push({index: i, item});
    });
    newItems.forEach((item, i) => {
        if (!oldIds[item.ID]) added.push({index: i, item});
        else if (oldIds[item.ID] != item)
            updated.push({index: i, oldItem: oldIds[item.ID], newItem: item});
    });

    return {removed, added, updated};
}
