import {DataCacher, IDataHook, IDataRetriever} from "model-react";

/**
 * Creates a new data cacher for lists, such that items aren't recreated when an item is added or removed
 * @param getItems gets all of the items to map
 * @param getID get the ID of the of the item
 * @param create Create a new instance for the given item
 * @returns The data cacher to manage the
 */
export function createListCacher<S, I, T>(
    getItems: IDataRetriever<S[]>,
    getID: (item: S, hook: IDataHook) => I,
    create: (item: S, hook: IDataHook) => T
): DataCacher<{map: Map<I, T>; items: T[]}> {
    return new DataCacher<{
        map: Map<I, T>;
        items: T[];
    }>((h, prev) => {
        const items = getItems(h);
        const map = new Map<I, T>(prev?.map ?? []);
        return {
            items: items.map(sourceItem => {
                const ID = getID(sourceItem, h);
                let item = map.get(ID);
                if (!item) {
                    item = create(sourceItem, h);
                    map.set(ID, item);
                }
                return item;
            }),
            map,
        };
    });
}
