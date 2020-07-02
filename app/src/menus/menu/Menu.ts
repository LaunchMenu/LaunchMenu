import {IMenuItem} from "../_types/IMenuItem";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {IDataHook, Field} from "model-react";
import {SortedList} from "../../utils/SortedList";
import {IMenuItemCallback} from "./_types/IMenuItemCallback";
import {GeneratorStreamExtractor} from "../../utils/generator/GeneratorStreamExtractor";

/**
 * A menu class to control menu items and their state
 */
export class Menu {
    protected maxItemCount?: number;

    // Tracking menu items
    protected items = new SortedList<IPrioritizedMenuItem>(
        ({priority: a}, {priority: b}) => a > b
    );
    protected cursor = new Field(null as IMenuItem | null);
    protected selected = new Field([] as IMenuItem[]);

    // Batch insert items data
    protected insertingItems: IPrioritizedMenuItem[] = [];
    protected timeoutID: NodeJS.Timeout | null;

    // Item generator data
    protected generators = new Field(
        [] as GeneratorStreamExtractor<IPrioritizedMenuItem>[]
    );

    /**
     * Creates a new menu
     * @param maxItemCount The maximum number of items to store (defaults to infinite)
     */
    public constructor(maxItemCount?: number);
    /**
     * Creates a new menu
     * @param items The initial items to store
     * @param maxItemCount  The maximum number of items to store (defaults to infinite)
     */
    public constructor(
        items: IMenuItem[] | ((cb: IMenuItemCallback) => Promise<void>),
        maxItemCount?: number
    );
    public constructor(
        items:
            | IMenuItem[]
            | ((cb: IMenuItemCallback) => Promise<void>)
            | number
            | undefined,
        maxItemCount?: number
    ) {
        if (typeof items == "number") {
            this.maxItemCount = items;
        } else {
            if (items instanceof Array) this.addItems(items);
            else if (items instanceof Function) this.addItems(items);
            this.maxItemCount = maxItemCount;
        }
    }

    // Item management
    /**
     * Adds an item to the the menu
     * @param item The item to add with its priority
     * @param batchInsert Whether to batch multiple items before inserting (defaults to false)
     */
    public addItem(item: IPrioritizedMenuItem, batchInsert?: boolean): void;
    /**
     * Adds an item to the menu
     * @param item The item to add
     * @param index The index to add the item at (defaults to the last index; Infinity)
     * @param batchInsert Whether to batch multiple items before inserting (defaults to false)
     */
    public addItem(item: IMenuItem, index?: number): void;
    public addItem(
        item: IMenuItem | IPrioritizedMenuItem,
        index: number | boolean | undefined,
        batchInsert?: boolean
    ) {
        let batch: boolean;
        // Normalize the item
        if (!("priority" in item)) {
            const items = this.items.get();
            if (items.length > 0) {
                const da =
                    items[
                        Math.max(
                            0,
                            Math.min((index as number) || Infinity, items.length - 1)
                        )
                    ];
                item = {item: item, priority: da.priority * 0.999};
            } else item = {item: item, priority: 1e6};
            batch = batchInsert || false;
        } else {
            batch = index as boolean;
        }

        // Add the item directly or add to the batch to be added later
        if (batch) {
            this.insertingItems.push(item);
            if (!this.timeoutID)
                this.timeoutID = setTimeout(() => this.flushItemBatch(), 100);
        } else {
            this.items.add(item, this.maxItemCount);
        }
    }

    /**
     * Flushes the batch of items that are currently inserting to the main items list
     */
    protected flushItemBatch(): void {
        if (!this.insertingItems.length) return;
        if (this.timeoutID) clearTimeout(this.timeoutID);
        this.timeoutID = null;
        const items = this.insertingItems;
        this.insertingItems = [];
        this.items.add(items, this.maxItemCount);
    }

    /**
     * Adds all the items from the given array
     * @param items The generator to get items from
     */
    public addItems(items: IMenuItem[]): void;
    /**
     * Adds items from the given generator function
     * @param generator The generator to get items from
     * @returns A promise that resolves when all items are added, or the generator is canceled
     */
    public addItems(generator: (cb: IMenuItemCallback) => Promise<void>): Promise<void>;
    public addItems(
        items: IMenuItem[] | ((cb: IMenuItemCallback) => Promise<void>)
    ): void | Promise<void> {
        if (items instanceof Function) {
            const generator = new GeneratorStreamExtractor(items, item =>
                this.addItem(item)
            );

            this.generators.set([...this.generators.get(null), generator]);

            return generator.start().then(() => {
                // Remove the generator when it's finished
                const generators = this.generators.get(null);
                if (generators.includes(generator))
                    this.generators.set(generators.filter(gen => gen == generator));
            });
        } else {
            items.forEach(item => this.addItem(item));
        }
    }

    /**
     * Removes an item from the menu
     * @param item The item to remove
     * @returns Whether the item was in the menu (and now removed)
     */
    public removeItem(item: IPrioritizedMenuItem): boolean;
    /**
     * Removes an item from the menu
     * @param item The item to remove
     * @returns Whether the item was in the menu (and now removed)
     */
    public removeItem(item: IMenuItem): boolean;
    public removeItem(item: IMenuItem | IPrioritizedMenuItem): boolean {
        if (!("priority" in item)) {
            const items = this.items.get();
            const index = items.findIndex(it => it.item == item);
            if (index != -1) {
                this.items.removeIndex(index);
                return true;
            }
        } else {
            return this.items.remove(item);
        }
        return false;
    }

    /**
     * Selects or deselects the given item
     * @param item The item to select or deselect
     * @param selected Whether to select or deselect
     */
    public setSelected(item: IMenuItem, selected: boolean = true): void {
        const selectedItems = this.selected.get(null);
        if (selected) {
            if (!selectedItems.includes(item))
                this.selected.set([...selectedItems, item]);
        } else {
            if (selectedItems.includes(item))
                this.selected.set(selectedItems.filter(i => i != item));
        }
    }

    /**
     * Selects an item to be the cursor
     * @param item The new cursor
     */
    public setCursor(item: IMenuItem): void {
        this.cursor.set(item);
    }

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook: IDataHook): IMenuItem[] {
        this.flushItemBatch();
        return this.items.get(hook).map(({item}) => item);
    }

    /**
     * Retrieves the currently selected items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The selected menu items
     */
    public getSelected(hook: IDataHook): IMenuItem[] {
        return this.selected.get(hook);
    }

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    public getCursor(hook: IDataHook): IMenuItem | null {
        const cursor = this.cursor.get(hook);
        if (!cursor) {
            // If no cursor is selected, select the first index by default
            return this.getItems(hook)[0];
        } else {
            return cursor;
        }
    }

    /**
     * Retrieves the generators that are currently adding items to this menu
     * @param hook The hook to subscribe to changes
     * @returns The generators
     */
    public getGenerators(
        hook: IDataHook
    ): GeneratorStreamExtractor<IPrioritizedMenuItem>[] {
        return this.generators.get(hook);
    }
}
