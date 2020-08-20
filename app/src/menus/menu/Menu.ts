import {IMenuItem} from "../items/_types/IMenuItem";
import {IDataHook, Field} from "model-react";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {TRequired} from "../../_types/TRequired";
import {ICategory} from "../actions/types/category/_types/ICategory";
import {getMenuCategory} from "../actions/types/category/getCategoryAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {isItemSelectable} from "../items/isItemSelectable";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";

/**
 * A menu class to control menu items and their state,
 * optimized for small item sets.
 */
export class Menu {
    protected categoryConfig: TRequired<IMenuCategoryConfig>;
    protected destroyed = new Field(false);

    // Tracking menu items
    protected rawCategories = [{items: [], category: undefined}] as {
        items: IMenuItem[];
        category: ICategory | undefined;
    }[];
    protected categories = new Field([] as IMenuCategoryData[]);
    protected items = new Field([] as IMenuItem[]); // Flat structure containing items (as IMenuItems) and categories headers (as IMenuItems)
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
        if (items instanceof Array) config = categoryConfig;
        else config = items;

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
    public addItem(item: IMenuItem, index: number = Infinity): void {
        const added = this.addItemWithoutUpdate(item, this.rawCategories, index);
        this.updateItemsList();

        // Call the menu change listener
        if (added) onMenuChangeAction.get([item]).onMenuChange(this, true);
    }

    /**
     * Adds all the items from the given array at once (slightly more efficient than adding one by one)
     * @param items The generator to get items from
     */
    public addItems(items: IMenuItem[]): void {
        const addedItems = items.filter(item =>
            this.addItemWithoutUpdate(item, this.rawCategories)
        );
        this.updateItemsList();

        // Call the menu change listener
        onMenuChangeAction.get(addedItems).onMenuChange(this, true);
    }

    /**
     * Adds an item to the menu without updating the item list
     * @param item The item to add
     * @param destination The list to add the item to
     * @param index The index to add the item at within its category (defaults to the last index; Infinity)
     * @returns Added whether the item was added
     */
    protected addItemWithoutUpdate(
        item: IMenuItem,
        destination: IMenuCategoryData[],
        index: number = Infinity
    ): boolean {
        const category = this.categoryConfig.getCategory(item);
        const categoryIndex = destination.findIndex(({category: c}) => c == category);

        // Add the item to a new or existing category
        if (categoryIndex == -1) {
            destination.push({category, items: [item]});
        } else {
            const {items} = destination[categoryIndex];
            if (items.length >= this.categoryConfig.maxCategoryItemCount) return false;
            items.splice(index, 0, item);
        }
        return true;
    }

    /**
     * Removes an item from the menu
     * @param item The item to remove
     * @returns Whether the item was in the menu (and now removed)
     */
    public removeItem(item: IMenuItem): boolean {
        return this.removeItems([item]);
    }

    /**
     * Removes all the items from the given array at once (slightly more efficient than removing one by one)
     * @param item The item to remove
     * @returns Whether any item was in the menu (and now removed)
     */
    public removeItems(items: IMenuItem[]): boolean {
        let removed = [] as IMenuItem[];
        const selectedItems = this.selected.get(null);

        items.forEach(item => {
            const category = this.categoryConfig.getCategory(item);
            const categoryIndex = this.rawCategories.findIndex(
                ({category: c}) => c == category
            );

            // Add the item to a new or existing category
            if (categoryIndex != -1) {
                const {items} = this.rawCategories[categoryIndex];
                const index = items.indexOf(item);
                if (index != -1) {
                    items.splice(index, 1);
                    if (items.length == 0) this.rawCategories.splice(categoryIndex, 1);
                    removed.push(item);

                    // Make sure the item isn't the selected and or cursor item
                    if (selectedItems.includes(item)) this.setSelected(item, false);
                }
            }
        });

        if (removed.length > 0) {
            this.updateItemsList();

            // Call the menu change listener
            onMenuChangeAction.get(items).onMenuChange(this, false);
            return true;
        }
        return false;
    }

    /**
     * Synchronizes the item list to be up to date with the categories data
     */
    protected updateItemsList(): void {
        const order = this.categoryConfig.sortCategories(this.rawCategories);

        // Combine the items and categories into a single list
        const items = [] as IMenuItem[];
        const categories = [] as IMenuCategoryData[];
        order.forEach(category => {
            const categoryData = this.rawCategories.find(
                ({category: c}) => c == category
            );
            if (categoryData) {
                categories.push({category, items: categoryData.items});
                if (category) items.push(category.item, ...categoryData.items);
                else items.push(...categoryData.items);
            }
        });
        this.categories.set(categories);
        this.items.set(items);

        this.deselectRemovedCursor();
    }

    /**
     * Checks whether the cursor item is still present, and deselects it if not
     */
    protected deselectRemovedCursor(): void {
        const items = this.items.get(null);
        const cursor = this.cursor.get(null);
        updateCursor: if (cursor == null || !items.includes(cursor)) {
            for (let i = 0; i < items.length; i++)
                if (isItemSelectable(items[i])) {
                    this.setCursor(items[i]);
                    break updateCursor;
                }
            this.setCursor(null);
        }
    }

    /**
     * Selects or deselects the given item
     * @param item The item to select or deselect
     * @param selected Whether to select or deselect
     */
    public setSelected(item: IMenuItem, selected: boolean = true): void {
        if (this.items.get(null).includes(item) && !this.destroyed.get(null)) {
            const selectedItems = this.selected.get(null);
            if (selected) {
                if (!selectedItems.includes(item)) {
                    this.selected.set([...selectedItems, item]);
                    onSelectAction.get([item]).onSelect(true, this);
                }
            } else {
                if (selectedItems.includes(item)) {
                    this.selected.set(selectedItems.filter(i => i != item));
                    onSelectAction.get([item]).onSelect(false, this);
                }
            }
        }
    }

    /**
     * Selects an item to be the cursor
     * @param item The new cursor
     */
    public setCursor(item: IMenuItem | null): void {
        if ((!item || this.items.get(null).includes(item)) && !this.destroyed.get(null)) {
            const currentCursor = this.cursor.get(null);
            if (currentCursor) onCursorAction.get([currentCursor]).onCursor(false, this);

            this.cursor.set(item);

            if (item) onCursorAction.get([item]).onCursor(true, this);
        }
    }

    /**
     * Destroys the menu, making sure that all items are unselected
     */
    public destroy() {
        if (this.destroyed.get(null) == true) return;
        this.destroyed.set(true);
        onSelectAction.get(this.selected.get(null)).onSelect(false, this);
        const cursor = this.cursor.get(null);
        if (cursor) onCursorAction.get([cursor]).onCursor(false, this);
    }

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        return this.items.get(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook: IDataHook = null): IMenuCategoryData[] {
        if (this.isDestroyed(hook)) return [];
        return this.categories.get(hook);
    }

    /**
     * Retrieves the currently selected items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The selected menu items
     */
    public getSelected(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        return this.selected.get(hook);
    }

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    public getCursor(hook: IDataHook = null): IMenuItem | null {
        if (this.isDestroyed(hook)) return null;
        return this.cursor.get(hook);
    }

    /**
     * Retrieves all the selected items including the cursor
     * @param hook The hook to subscribe to changes
     * @returns The selected items including the cursor
     */
    public getAllSelected(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        const cursor = this.cursor.get(hook);
        const selected = this.getSelected(hook);
        if (cursor && !selected.includes(cursor)) return [...selected, cursor];
        return selected;
    }

    /**
     * Retrieves whether the menu has been destroyed
     * @param hook The hook to subscribe to changes
     * @returns Whether the menu was destroyed
     */
    public isDestroyed(hook: IDataHook = null): boolean {
        return this.destroyed.get(hook);
    }
}
