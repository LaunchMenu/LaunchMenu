import {IIdentifiedItem} from "./_types/IIdentifiedItem";

/**
 * Retrieves the changes between two stacks of items. Items are only allowed to be removed or added, not switch places (swaps are ignored)
 * @param oldItems The previous item list
 * @param newItems The new item list
 * @param equals A function to determine equivalence of two items
 * @returns The added and removed items lists
 */
export function findStackChanges<D extends IIdentifiedItem<any>>(
    oldItems: D[],
    newItems: D[]
): {added: {index: number; item: D}[]; removed: {index: number; item: D}[]} {
    // Check ids in old and new group
    const oldIds = {};
    const newIds = {};
    oldItems.forEach(({id}) => (oldIds[id] = true));
    newItems.forEach(({id}) => (newIds[id] = true));

    // Check whether all ids are present and add to added or removed otherwise
    const removed = [] as {index: number; item: D}[];
    const added = [] as {index: number; item: D}[];
    oldItems.forEach((item, i) => {
        if (!newIds[item.id]) removed.push({index: i, item});
    });
    newItems.forEach((item, i) => {
        if (!oldIds[item.id]) added.push({index: i, item});
    });

    return {removed, added};
}
