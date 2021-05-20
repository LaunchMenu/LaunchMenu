import {IMenuItem} from "../items/_types/IMenuItem";
import {IDataHook, Field} from "model-react";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {TRequired} from "../../_types/TRequired";
import {isItemSelectable} from "../items/isItemSelectable";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {AbstractMenu} from "./AbstractMenu";
import {IIOContext} from "../../context/_types/IIOContext";
import {createCallbackHook} from "../../utils/createCallbackHook";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {baseSettings} from "../../application/settings/baseSettings/baseSettings";
import {createCategoryGetter} from "./standardConfig/createCategoryGetter";

// TODO: start using the MenuItemCategorizer to separate/offload concerns

/**
 * A menu class to control menu items and their state,
 * optimized for small item sets.
 */
export class Menu extends AbstractMenu {
    protected categoryConfig: TRequired<IMenuCategoryConfig>;

    // Tracking menu items
    protected rawCategories = [{items: [], category: undefined}] as {
        items: IMenuItem[];
        category: ICategory | undefined;
    }[];
    protected categories = new Field([] as IMenuCategoryData[]);
    protected items = new Field([] as IMenuItem[]); // Flat structure containing items (as IMenuItems) and categories headers (as IMenuItems)

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param categoryConfig The configuration for category options
     */
    public constructor(context: IIOContext, categoryConfig?: IMenuCategoryConfig);

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param items The initial items to store
     * @param categoryConfig The configuration for category options
     */
    public constructor(
        context: IIOContext,
        items: IMenuItem[],
        categoryConfig?: IMenuCategoryConfig
    );
    public constructor(
        context: IIOContext,
        items: IMenuItem[] | IMenuCategoryConfig | undefined,
        categoryConfig?: IMenuCategoryConfig
    ) {
        super(context);
        let config: IMenuCategoryConfig | undefined;
        if (items instanceof Array) config = categoryConfig;
        else config = items;

        // Create the category config
        const menuSettings = context.settings.get(baseSettings).menu;
        this.categoryConfig = {
            getCategory: config?.getCategory || createCategoryGetter(context),
            sortCategories:
                config?.sortCategories ||
                (categories => categories.map(({category}) => category)),
            maxCategoryItemCount:
                config?.maxCategoryItemCount ?? menuSettings.maxMenuSize.get(),
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
        // Create a hook to move the item when the category is updated
        const [categoryChangeCallback, destroyHook] = createCallbackHook(() => {
            const categoryData = destination.find(({category: c}) => c == category);
            const inMenu = categoryData?.items.includes(item);
            if (!inMenu) return;

            const categoryChanged = category != this.categoryConfig.getCategory(item);
            if (categoryChanged) {
                this.removeItems([item], category);
                this.addItem(item);
            } else this.categoryConfig.getCategory(item, categoryChangeCallback);
        }, 0); // TODO: store the destroyHook somewhere and call it when item gets removed

        // Obtain the category
        const category = this.categoryConfig.getCategory(item, categoryChangeCallback);
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
     * @param oldCategory The category that item was in (null to use the items' latest category)
     * @returns Whether any item was in the menu (and now removed)
     */
    public removeItems(
        items: IMenuItem[],
        oldCategory: ICategory | null = null
    ): boolean {
        let removed = [] as IMenuItem[];
        const selectedItems = this.selected.get();

        items.forEach(item => {
            const category =
                oldCategory != null ? oldCategory : this.categoryConfig.getCategory(item);
            const categoryIndex = this.rawCategories.findIndex(
                ({category: c}) => c == category
            );

            // Add the item to a new or existing category
            if (categoryIndex != -1) {
                const {items} = this.rawCategories[categoryIndex];
                const index = items.indexOf(item);
                if (index != -1) {
                    items.splice(index, 1);
                    // Don't remove categories with items or the default category
                    if (items.length == 0 && category)
                        this.rawCategories.splice(categoryIndex, 1);
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
        const items = this.items.get();
        const cursor = this.cursor.get();
        updateCursor: if (cursor == null || !items.includes(cursor)) {
            for (let i = 0; i < items.length; i++)
                if (isItemSelectable(items[i])) {
                    this.setCursor(items[i]);
                    break updateCursor;
                }
            this.setCursor(null);
        }
    }

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook?: IDataHook): IMenuItem[] {
        if (this.isDestroyed(hook))
            // Whenever the menu is destroyed, we no longer inform about item changes
            return this.items.get();
        return this.items.get(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook?: IDataHook): IMenuCategoryData[] {
        if (this.isDestroyed(hook))
            // Whenever the menu is destroyed, we no longer inform about category changes
            return this.categories.get();
        return this.categories.get(hook);
    }
}
