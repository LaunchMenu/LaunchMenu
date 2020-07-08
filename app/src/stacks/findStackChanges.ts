/**
 * Retrieves the changes between two stacks of items. Items are only allowed to be removed or added, not switch places (this will be considered a remove and add)
 * @param oldItems The previous item list
 * @param newItems The new item list
 * @param equals A function to determine equivalence of two items
 * @returns The added and removed items lists
 */
export function findStackChanges<D>(
    oldItems: D[],
    newItems: D[],
    equals: (a: D, b: D) => boolean = (a, b) => a == b
): {added: {index: number; item: D}[]; removed: {index: number; item: D}[]} {
    // LCS implementation
    const table = [] as number[][];
    for (let i = 0; i < oldItems.length + 1; i++) {
        table.push(new Array(newItems.length + 1));
        table[i][0] = 0;
    }
    for (let i = 0; i < newItems.length + 1; i++) table[0][i] = 0;

    for (let i = 0; i < oldItems.length; i++)
        for (let j = 0; j < newItems.length; j++)
            table[i + 1][j + 1] = equals(oldItems[i], newItems[j])
                ? table[i][j] + 1
                : Math.max(table[i + 1][j], table[i][j + 1]);

    // Use the LCS data table to find removals and additions
    const removed = [] as {index: number; item: D}[];
    const added = [] as {index: number; item: D}[];

    let i = oldItems.length;
    let j = newItems.length;
    while (i > -1 || j > -1) {
        // If the items are equivalent, both are included
        if (equals(oldItems[i], newItems[j])) {
            i -= 1;
            j -= 1;
            // If there is no change dependent on old item index, the old item wasn't matched (removed)
        } else if (i >= 0 && table[i + 1][j + 1] == table[i][j + 1]) {
            removed.unshift({item: oldItems[i], index: i});
            i -= 1;
            // If there is no change dependent on new item index, the new item wasn't matched (added)
        } else {
            added.unshift({item: newItems[j], index: j});
            j -= 1;
        }
    }

    return {removed, added};
}
