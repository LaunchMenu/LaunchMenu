import {IDataHook, Field, DataCacher} from "model-react";
import {IStack} from "./_types/IStack";

/**
 * A stack of items and substacking system
 */
export class Stack<T> implements IStack<T> {
    protected rawItems = new Field([] as (T | this)[]);
    protected items = new DataCacher(h =>
        this.rawItems
            .get(h)
            .reduce(
                (items, item) => items.concat(item instanceof Stack ? item.get(h) : item),
                [] as T[]
            )
    );

    protected equals: (a: T | this, b: T | this) => boolean = (a, b) => a == b;

    /**
     * Creates a new stack
     * @param init The initial items of the stack
     */
    public constructor(init?: T[]) {
        if (init) this.rawItems.set(init);
    }

    // Primary alteration methods
    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     */
    public push(...item: (T | this)[]): void {
        this.rawItems.set(this.rawItems.get(null).concat(...item));
    }

    /**
     * Removes an item or substack from the top of the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public pop(...item: (T | this)[]): boolean {
        const rawItems = this.rawItems.get(null);
        if (item.length == 0) {
            this.rawItems.set(rawItems.slice(0, rawItems.length - 1));
            return true;
        } else {
            const newRawItems = rawItems.slice(0, rawItems.length - item.length).concat(
                rawItems
                    .slice(rawItems.length - item.length)
                    .filter((it, i) => !this.equals(it, item[i])) // Keep all items that don't correspond to the item at that index from the top
            );
            if (newRawItems.length != rawItems.length) {
                this.rawItems.set(newRawItems);
                return true;
            }
        }
        return false;
    }

    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    public insert(item: T | this, index: number): void {
        const rawItems = this.rawItems.get(null);
        this.rawItems.set(
            rawItems.slice(0, index).concat(item, ...rawItems.slice(index))
        );
    }

    /**
     * Removes an item anywhere in the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public remove(item: T | this): boolean {
        const rawItems = this.rawItems.get(null);
        const index = rawItems.findIndex(this.equals.bind(this, item));
        if (index != -1) {
            this.rawItems.set(rawItems.slice(0, index).concat(rawItems.slice(index + 1)));
            return true;
        }
        return false;
    }

    // Recursive methods that ignore the presence of substacks handling the stack as if there's no hierarchy
    /**
     * Adds an item to the top of the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     */
    public pushFlat(...item: (T | this)[]): void {
        let rawItems = this.rawItems.get(null);
        const top = rawItems[rawItems.length - 1];
        if (top instanceof Stack) top.pushFlat(...item);
        else this.rawItems.set(rawItems.concat(...item));
    }

    /**
     * Removes a single item from the top of the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public popFlat(item?: T | this): boolean {
        let rawItems = this.rawItems.get(null);
        let index = rawItems.length - 1;
        let top = rawItems[index];

        // Find the first item or non empty stack on the top of the stack
        while (top instanceof Stack && top.get().length == 0) top = rawItems[--index];

        // If the top item is a stack that contains items, remove an item
        if (top instanceof Stack) {
            // If the item is the stack itself, remove the stack
            if (item == top) {
                this.rawItems.set(rawItems.slice(0, rawItems.length - 1));
                return true;
            }
            // Else remove an item from the stack
            else return top.popFlat(item);
        }
        // If the top is a regular item, remove it if it matches
        else if (!(top instanceof Stack) && (!item || this.equals(top, item))) {
            this.rawItems.set(rawItems.slice(0, rawItems.length - 1));
            return true;
        }

        return false;
    }

    /**
     * Inserts an item into the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    public insertFlat(item: T | this, index: number): void {
        const rawItems = this.rawItems.get(null);
        for (let i = 0; i < rawItems.length; i++) {
            const rawItem = rawItems[i];
            // If the raw item is a stack, check if the index is within the stack's range
            if (rawItem instanceof Stack) {
                const items = rawItem.get();
                if (index - items.length < 0) {
                    rawItem.insertFlat(item, index);
                    return;
                }
                index -= items.length;
            }
            // Otherwise check if the index is reached
            else {
                index--;
                if (index < 0) {
                    this.rawItems.set(
                        rawItems.slice(0, i).concat(item, ...rawItems.slice(i))
                    );
                    return;
                }
            }
        }
        this.rawItems.set(rawItems.concat(item));
    }

    /**
     * Removes an item anywhere in the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public removeFlat(item: T | this): boolean {
        const rawItems = this.rawItems.get(null);
        const index = rawItems.findIndex(this.equals.bind(this, item));
        if (index != -1) {
            this.rawItems.set(rawItems.slice(0, index).concat(rawItems.slice(index + 1)));
            return true;
        } else {
            // If the item isn't in this stack directly, try to remove it from each substack until found
            for (let i = 0; i < rawItems.length; i++) {
                const rawItem = rawItems[i];
                if (rawItem instanceof Stack) {
                    const removed = rawItem.removeFlat(item);
                    if (removed) return true;
                }
            }
        }
        return false;
    }

    // Retrieval methods
    /**
     * Retrieves all items and substacks in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items and substacks
     */
    public getRaw(hook: IDataHook = null): readonly (T | this)[] {
        return this.rawItems.get(hook);
    }

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    public get(hook: IDataHook = null): readonly T[] {
        return this.items.get(hook);
    }

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    public getTop(hook: IDataHook = null): undefined | T {
        const items = this.get(hook);
        return items[items.length - 1];
    }
}
