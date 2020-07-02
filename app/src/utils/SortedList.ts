import {Field, IDataHook} from "model-react";
import {quickSort} from "./quickSort";

/**
 * A list that sorts items as they are inserted
 */
export class SortedList<T> {
    protected list = new Field([] as T[]);
    protected condition: (a: T, b: T) => boolean;

    /**
     * Creates a new sorted list that sorts according to given condition
     * @param condition The sorting condition
     * @param items The initial items to add
     */
    public constructor(condition: (a: T, b: T) => boolean, items?: T[]) {
        this.condition = condition;
        if (items) this.add(items);
    }

    // Getters
    /**
     * Retrieves the items of the list
     * @param hook The hook to subscribe to changes
     * @returns The list of items
     */
    public get(hook?: IDataHook): T[] {
        return this.list.get(hook || null);
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
        const l = this.list.get(null);
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
        const curItems = this.list.get(null);
        let out: T[];
        if (items instanceof Array) {
            // Perform a simple sort on the batch of items, and perform a merge of the lists
            quickSort(items, this.condition);

            let n = 0;
            let m = 0;
            out = new Array(maxItems ? maxItems : curItems.length + items.length);
            for (var i = 0; i < out.length; i++) {
                if (
                    n != items.length &&
                    (m == curItems.length || !this.condition(curItems[m], items[n]))
                ) {
                    out[i] = items[n++];
                } else {
                    out[i] = curItems[m++];
                }
            }
        } else {
            // Perform inserting sort iteration
            out = new Array(maxItems ? maxItems : curItems.length + 1);
            let n = 0;
            let found = false;
            for (var i = 0; i < out.length; i++) {
                if (!found && !this.condition(curItems[n], items)) {
                    found = true;
                    out[i] = items;
                } else {
                    out[i] = curItems[n++];
                }
            }
        }
        this.list.set(out);
    }

    /**
     * Removes the given items from the list (more efficient than removing one at a time)
     * @param items The items to be removed
     * @returns Whether any items were remove
     */
    public remove(items: T[]): boolean;
    /**
     * Removes the given item from the list
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public remove(item: T): boolean;
    public remove(items: T[] | T): void | boolean {
        const curItems = this.list.get(null);
        let out: T[] = new Array(curItems.length);
        let n = 0;

        if (items instanceof Array) {
            // Sort the array, and perform a kind of 'merge filter'
            quickSort(items, this.condition);
            let m = 0;
            for (var i = 0; i < out.length; i++)
                if (items[m] != curItems[i]) out[n++] = curItems[i];
                else m++;
        } else {
            // Filter out this 1 item but copy the rest
            for (var i = 0; i < out.length; i++)
                if (items != curItems[i]) out[n++] = curItems[i];
        }

        out.length = n;
        this.list.set(out);
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
        const curItems = this.list.get(null);
        let out: T[] = new Array(curItems.length);
        let n = 0;

        if (indices instanceof Array) {
            quickSort(indices);
            let m = 0;
            for (var i = 0; i < out.length; i++)
                if (indices[m] != i) out[n++] = curItems[i];
                else m++;
        } else {
            for (var i = 0; i < out.length; i++) if (indices != i) out[n++] = curItems[i];
        }

        out.length = n;
        this.list.set(out);
    }

    /**
     * Removes all items from the list
     */
    public clear() {
        this.list.set([]);
    }
}
