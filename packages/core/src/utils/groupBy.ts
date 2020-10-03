/**
 * Groups a list by a given key
 * @param data The data to be grouped
 * @param getKey Either a key string of data objects to group on, or a function to retrieve the data to group on.
 *
 * E.G. for `data=[{t: 3, k:"y"}, {t: 1, k:"y"}]`, `geyKey="k"` or `getKey=v=>v.k`.
 * @param equals Comparison function to determine whether to given values to group on are equivalent
 * @returns The grouped data
 */
export function groupBy<A, N extends keyof A, F = A[N]>(
    data: A[],
    getKey: ((item: A) => F) | N,
    equals: (a: F, b: F) => boolean = (a, b) => a == b
): {key: F; values: A[]}[] {
    const result: {key: F; values: A[]}[] = [];
    const getter =
        getKey instanceof Function ? getKey : (item: A) => (item[getKey] as unknown) as F;

    data.forEach(item => {
        // Get the key, and find a group with this same key
        const newKey = getter(item);
        const group = result.find(({key}) => equals(newKey, key));
        if (group) {
            // If such a group is found, at the item
            group.values.push(item);
        } else {
            // Otherwise, create a group with this item
            const newGroup = {key: newKey, values: [item]};
            result.push(newGroup);
        }
    });

    return result;
}
