import {Field, IDataHook} from "model-react";
import {quickSort} from "./quickSort";

/**
 * A list that sorts items as they are inserted
 */
export class SortedList<T> {
    protected list = new Field([] as T[]);
    protected condition: (a: T, b: T) => boolean;
    protected onAdd?: (item: T) => void;
    protected onRemove?: (item: T) => void;

    /**
     * Creates a new sorted list that sorts according to given condition
     * @param condition The sorting condition
     * @param items The initial items to add
     */
    public constructor(data: {
        condition: (a: T, b: T) => boolean;
        onAdd?: (item: T) => void;
        onRemove?: (item: T) => void;
        items?: T[];
    }) {
        this.condition = data.condition;
        this.onAdd = data.onAdd;
        this.onRemove = data.onRemove;
        if (data.items) this.add(data.items);
    }

    // Getters
    /**
     * Retrieves the items of the list
     * @param hook The hook to subscribe to changes
     * @returns The list of items
     */
    public get(hook?: IDataHook): T[] {
        return this.list.get(hook);
    }

    /**
     * Finds the index of the given item in the list
     * @param item The item to look for
     * @returns The index if found, or -1 otherwise
     */
    public find(item: T): number;

    /**
     * Finds the index of the given item in the list
     * @param item The item to look for
     * @returns The index if found, or -1 otherwise
     */
    public find(
        checkItem: (item: T) => -1 | 0 | 1
    ): {index: -1} | {index: number; item: T};
    public find(
        checkItem: ((item: T) => -1 | 0 | 1) | T
    ): number | {index: number; item: T} | {index: -1} {
        const l = this.list.get();
        let start = 0;
        let end = l.length - 1;
        if (checkItem instanceof Function) {
            while (start < end) {
                const middle = Math.floor((start + end) / 2);
                const s = checkItem(l[middle]);
                if (s == 0) return {index: middle, item: l[middle]};
                else if (s == 1) start = middle + 1;
                else end = middle;
            }
            return {index: -1};
        } else {
            while (start < end) {
                const middle = Math.floor((start + end) / 2);
                if (this.condition(l[middle], checkItem)) start = middle + 1;
                else end = middle;
            }
            return l[start] == checkItem ? start : -1;
        }
    }

    // Edit methods
    /**
     * Adds an item to the list
     * @param item The item to add
     * @param maxItems The maximum number of items the list may contain (keeps the first items)
     */
    public add(item: T, maxItems?: number): void;
    /**
     * Adds a batch of items to the list (more efficient than adding one at a time)
     * @param items The items to add
     * @param maxItems The maximum number of items the list may contain (keeps the first items)
     */
    public add(items: T[], maxItems?: number): void;
    public add(items: T[] | T, maxItems?: number): void {
        const curItems = this.list.get();
        const lastItem = curItems[curItems.length - 1];
        let out: T[];

        if (!(items instanceof Array)) items = [items];

        // Ignore any items that aren't in the range
        if (maxItems && lastItem && curItems.length === maxItems) {
            items = items.filter(item => !this.condition(lastItem, item));
            if (items.length == 0) return;
        }

        // Perform a simple sort on the batch of items, and perform a merge of the lists
        if (items.length > 1) quickSort(items, this.condition);

        let n = 0;
        let m = 0;
        const maxOutLength = curItems.length + items.length;
        out = new Array(maxItems ? Math.min(maxItems, maxOutLength) : maxOutLength);
        for (let i = 0; i < out.length; i++) {
            if (
                n != items.length &&
                (m == curItems.length || !this.condition(curItems[m], items[n]))
            ) {
                out[i] = items[n++];
            } else {
                out[i] = curItems[m++];
            }
        }

        // Update the item list
        this.list.set(out);

        // Call add and remove listeners on items
        if (this.onRemove) for (; m < curItems.length; m++) this.onRemove(curItems[m]);
        if (this.onAdd) for (let i = 0; i < n; i++) this.onAdd(items[i]);
    }

    /**
     * Removes the given items from the list (more efficient than removing one at a time)
     * @param items The items to be removed
     * @param equals Check whether two items equal one and another
     * @returns Whether any items were remove
     */
    public remove(items: T[], equals?: (a: T, b: T) => boolean): boolean;
    /**
     * Removes the given item from the list
     * @param item The item to be removed
     * @param equals Check whether two items equal one and another
     * @returns Whether the item was removed
     */
    public remove(item: T, equals?: (a: T, b: T) => boolean): boolean;
    public remove(
        items: T[] | T,
        equals: (a: T, b: T) => boolean = (a, b) => a == b
    ): void | boolean {
        const curItems = this.list.get();
        const lastItem = curItems[curItems.length - 1];
        let out: T[] = new Array();

        if (!(items instanceof Array)) items = [items];

        // Ignore any items that aren't in the range
        if (!lastItem) return;
        items = items.filter(item => !this.condition(lastItem, item));
        if (items.length == 0) return;

        // Sort the array, and perform a kind of 'merge filter'
        if (items.length > 1) quickSort(items, this.condition);

        // FIlter the items
        let removed = [] as T[];
        let n = 0;
        let m = 0;
        for (var i = 0; i < curItems.length; i++)
            if (items[m] == undefined || !equals(items[m], curItems[i]))
                out[n++] = curItems[i];
            else {
                removed.push(curItems[i]);
                m++;
            }

        // Update the list
        out.length = n;
        this.list.set(out);

        // Call the listeners
        if (this.onRemove) removed.forEach(item => this.onRemove?.(item));

        return out.length < curItems.length;
    }

    /**
     * Removes the items at the given indices from the list (more efficient than removing one at a time)
     * @param indices The indices to remove
     */
    public removeIndex(indices: number[]): void;
    /**
     * Removes the item at the given index
     * @param index The index to remove
     */
    public removeIndex(index: number): void;
    public removeIndex(indices: number[] | number) {
        const curItems = this.list.get();
        let out: T[] = new Array(curItems.length);

        if (!(indices instanceof Array)) indices = [indices];

        // Sort the array, and perform a kind of 'merge filter'
        if (indices.length > 1) quickSort(indices);

        // Filter the items
        let removed = [] as T[];
        let n = 0;
        let m = 0;
        for (var i = 0; i < out.length; i++)
            if (indices[m] != i) out[n++] = curItems[i];
            else {
                removed.push(curItems[i]);
                m++;
            }

        // Update the list
        out.length = n;
        this.list.set(out);

        // Call the listeners
        if (this.onRemove) removed.forEach(item => this.onRemove?.(item));
    }

    /**
     * Removes all items that don't pass the filter
     * @param include The callback to determine whether to include a given item
     * @returns Whether any items were returned
     */
    public filter(include: (item: T) => boolean): boolean {
        const curItems = this.list.get();

        // Filter the items
        let removed = [] as T[];
        const out = curItems.filter(item => {
            const keep = include(item);
            if (!keep) removed.push(item);
            return keep;
        });

        // Update the list
        if (out.length >= curItems.length) return false;
        this.list.set(out);

        // Call the listeners
        if (this.onRemove) removed.forEach(item => this.onRemove?.(item));

        return true;
    }

    /**
     * Removes all items from the list
     */
    public clear() {
        this.list.set([]);
    }
}
