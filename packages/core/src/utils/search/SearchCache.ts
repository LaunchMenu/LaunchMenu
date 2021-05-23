import {Queue} from "../Queue";
import {IQueueNode} from "./_types/IQueueNode";
import {TCacheKeysList} from "./_types/TCacheKeysList";
import {TCacheMap} from "./_types/TCacheMap";

type IMapVal<K, V> = {value: V; node: IQueueNode<K>};

/**
 * A class to cache items that are created for a search, such that items aren't constantly replaced
 */
export class SearchCache<K extends [any, ...any], V> {
    protected create: (...key: K) => V;
    protected map = new Map() as TCacheMap<K, IMapVal<K, V>>;
    protected queue: Queue<K> = new Queue();
    protected maxSize: number = 0;

    /**
     * Creates a new search cache
     * @param create The function to create new values
     * @param maxSize The maximum number of items to keep in the cache
     */
    public constructor(create: (...key: K) => V, maxSize: number = 50) {
        this.create = create;
        this.maxSize = maxSize;
    }

    /**
     * Retrieves multiple items, either from the cache or newly created
     * @param items The keys of the items to get
     * @returns The items
     */
    public getAll(items: TCacheKeysList<K>): V[] {
        return items.map(key =>
            key instanceof Array
                ? this.get(...(key as any))
                : /** @ts-ignore */
                  this.get(key)
        );
    }

    /**
     * Retrieves an item, either from the cache or newly created
     * @param keys The keys to get the item for
     * @returns The item
     */
    public get(...keys: K): V {
        // If the map contains the value, return it
        let map: Map<any, any> | IMapVal<K, V> = this.map;
        for (let key of keys) {
            if (!(map instanceof Map)) break;
            map = map.get(key);
        }
        if (map) {
            const {node, value} = map as IMapVal<K, V>;

            // Add the keys to the back of the queue
            this.queue.removeNode(node);
            this.queue.push(keys);

            return value;
        }

        // Otherwise, create the value and store it
        const node = this.queue.push(keys);
        const value = this.create(...keys);
        this.add(this.map, keys, value, node);
        if (this.queue.getSize() > this.maxSize) {
            const removeKey = this.queue.pop();
            if (removeKey) this.remove(this.map, removeKey);
        }

        return value;
    }

    /**
     * Adds an item to the cache map
     * @param map The map to add the value to
     * @param keys The keys to add the value under
     * @param value The value to add
     * @param node The queue node to store in the map
     */
    protected add<MKeys extends [MK, ...MKrest], MK, MKrest extends any[]>(
        map: Map<MK, TCacheMap<MKrest, IMapVal<K, V>>>,
        [key, ...keys]: MKeys,
        value: V,
        node: IQueueNode<K>
    ): void {
        if (keys.length > 0) {
            let subMap = map.get(key);
            if (!subMap) {
                subMap = new Map() as TCacheMap<MKrest, IMapVal<K, V>>;
                map.set(key, subMap);
            }
            this.add(subMap as Map<any, any>, keys as [any, ...any[]], value, node);
        } else (map as Map<MK, IMapVal<K, V>>).set(key, {value, node});
    }

    /**
     * Removes an item from the cache
     * @param map The map to add the value to
     * @param keys The keys to remove the value from
     */
    protected remove<MKeys extends [MK, ...MKrest], MK, MKrest extends any[]>(
        map: Map<MK, TCacheMap<MKrest, IMapVal<K, V>>>,
        [key, ...keys]: MKeys
    ): void {
        if (keys.length > 0) {
            let subMap = map.get(key) as Map<any, any>;
            if (subMap) {
                this.remove(subMap as Map<any, any>, keys as [any, ...any[]]);
                if (subMap.size == 0) map.delete(key);
            }
        } else (map as Map<MK, IMapVal<K, V>>).delete(key);
    }
}
