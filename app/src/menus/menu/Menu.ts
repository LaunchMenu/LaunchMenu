import {IMenuItem} from "../_types/IMenuItem";
import {IDataHook, Field} from "model-react";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {TFull} from "../../_types/TFull";
import {ICategory} from "../category/_types/ICategory";
import {getMenuCategory} from "../category/getCategoryAction";

/**
 * A menu class to control menu items and their state
 */
export class Menu {
    protected categoryConfig: TFull<IMenuCategoryConfig>;

    // Tracking menu items
    protected categories = [{items: [], category: undefined}] as {
        items: IMenuItem[];
        category: ICategory | undefined;
    }[];
    protected items = new Field([] as IMenuItem[]);
    protected cursor = new Field(null as IMenuItem | null);
    protected selected = new Field([] as IMenuItem[]);

    /**
     * Creates a new menu
     * @param categoryConfig The configuration for category options
     */
    public constructor(categoryConfig?: IMenuCategoryConfig);

    /**
     * Creates a new menu
     * @param items The initial items to store
     * @param categoryConfig The configuration for category options
     */
    public constructor(items: IMenuItem[], categoryConfig?: IMenuCategoryConfig);
    public constructor(
        items: IMenuItem[] | IMenuCategoryConfig | undefined,
        categoryConfig?: IMenuCategoryConfig
    ) {
        let config: IMenuCategoryConfig | undefined;
        if (items instanceof Array) {
            config = categoryConfig;
        } else {
            config = items;
        }

        // Create the category config
        this.categoryConfig = {
            getCategory: config?.getCategory || getMenuCategory,
            sortCategories:
                config?.sortCategories ||
                (categories => categories.map(({category}) => category)),
            maxCategoryItemCount: config?.maxCategoryItemCount || Infinity,
        };

        // Add the default items
        if (items instanceof Array) this.addItems(items);
    }

    // Item management
    /**
     * Adds an item to the menu
     * @param item The item to add
     * @param index The index to add the item at within its category (defaults to the last index; Infinity)
     */
    public addItem(item: IMenuItem, index: number = Infinity) {
        const category = this.categoryConfig.getCategory(item);
        const categoryIndex = this.categories.findIndex(({category: c}) => c == category);

        // Add the item to a new or existing category
        if (categoryIndex == -1) {
            this.categories.push({category, items: [item]});
        } else {
            const {items} = this.categories[categoryIndex];
            if (items.length >= this.categoryConfig.maxCategoryItemCount) return;
            items.splice(index, 0, item);
        }

        this.updateItemsList();
    }

    /**
     * Adds all the items from the given array at once (slightly more efficient than adding one by one)
     * @param items The generator to get items from
     */
    public addItems(items: IMenuItem[]): void {
        items.forEach(item => {
            const category = this.categoryConfig.getCategory(item);
            const categoryIndex = this.categories.findIndex(
                ({category: c}) => c == category
            );

            // Add the item to a new or existing category
            if (categoryIndex == -1) {
                this.categories.push({category, items: [item]});
            } else {
                const {items} = this.categories[categoryIndex];
                if (items.length >= this.categoryConfig.maxCategoryItemCount) return;
                items.splice(Infinity, 0, item);
            }
        });

        this.updateItemsList();
    }

    /**
     * Removes an item from the menu
     * @param item The item to remove
     * @returns Whether the item was in the menu (and now removed)
     */
    public removeItem(item: IMenuItem): boolean {
        const category = this.categoryConfig.getCategory(item);
        const categoryIndex = this.categories.findIndex(({category: c}) => c == category);

        // Add the item to a new or existing category
        if (categoryIndex != -1) {
            const {items} = this.categories[categoryIndex];
            const index = items.indexOf(item);
            if (index != -1) {
                items.splice(index, 1);
                if (items.length == 0) this.categories.splice(categoryIndex, 1);

                this.updateItemsList();
                return true;
            }
        }

        return false;
    }

    /**
     * Removes all the items from the given array at once (slightly more efficient than removing one by one)
     * @param item The item to remove
     * @returns Whether any item was in the menu (and now removed)
     */
    public removeItems(items: IMenuItem[]): boolean {
        let altered = false;
        items.forEach(item => {
            const category = this.categoryConfig.getCategory(item);
            const categoryIndex = this.categories.findIndex(
                ({category: c}) => c == category
            );

            // Add the item to a new or existing category
            if (categoryIndex != -1) {
                const {items} = this.categories[categoryIndex];
                const index = items.indexOf(item);
                if (index != -1) {
                    items.splice(index, 1);
                    if (items.length == 0) this.categories.splice(categoryIndex, 1);

                    altered = true;
                }
            }
        });

        if (altered) {
            this.updateItemsList();
            return true;
        }
        return false;
    }

    /**
     * Synchronizes the item list to be up to date with the categories data
     */
    protected updateItemsList(): void {
        const order = this.categoryConfig.sortCategories(this.categories);

        // Combine the items and categories into a single list
        const items = [] as IMenuItem[];
        order.forEach(category => {
            const categoryData = this.categories.find(({category: c}) => c == category);
            if (categoryData)
                if (category) items.push(category.item, ...categoryData.items);
                else items.push(...categoryData.items);
        });
        this.items.set(items);
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
    public getItems(hook: IDataHook = null): IMenuItem[] {
        return this.items.get(hook);
    }

    /**
     * Retrieves the currently selected items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The selected menu items
     */
    public getSelected(hook: IDataHook = null): IMenuItem[] {
        return this.selected.get(hook);
    }

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    public getCursor(hook: IDataHook = null): IMenuItem | null {
        const cursor = this.cursor.get(hook);
        if (!cursor) {
            // If no cursor is selected, select the first index by default
            return this.getItems(hook)[0];
        } else {
            return cursor;
        }
    }
}
