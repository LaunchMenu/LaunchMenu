import {IDataHook, Field, isDataLoadRequest} from "model-react";
import {IMenuItem} from "../items/_types/IMenuItem";
import {TRequired} from "../../_types/TRequired";
import {IPrioritizedMenuCategoryConfig} from "./_types/IAsyncMenuCategoryConfig";
import {SortedList} from "../../utils/SortedList";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";
import {ICategory} from "../actions/types/category/_types/ICategory";
import {getMenuCategory} from "../actions/types/category/getCategoryAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {isItemSelectable} from "../items/isItemSelectable";
import {IGenerator} from "../../utils/generator/_types/IGenerator";
import {GeneratorStreamExtractor} from "../../utils/generator/GeneratorStreamExtractor";
import {sortPrioritizedCategories} from "./SortPrioritizedCategories";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {AbstractMenu} from "./AbstractMenu";
import {IIOContext} from "../../context/_types/IIOContext";
import {createCallbackHook} from "../../utils/modelReact/createCallbackHook";

type CategoryData<T> = {
    items: SortedList<IPrioritizedMenuItem<T>>;
    category: ICategory | undefined;
    batch?: {
        add: IPrioritizedMenuItem<T>[];
        remove: IPrioritizedMenuItem<T>[];
        clear?: boolean;
    };
};

const createSortedList = <T>(changeList: {
    added: IMenuItem[];
    removed: IMenuItem[];
}): SortedList<IPrioritizedMenuItem<T>> =>
    new SortedList({
        condition: (a, b) => a.priority >= b.priority,
        onAdd: ({item}) => changeList.added.push(item),
        onRemove: ({item}) => changeList.removed.push(item),
    });

/**
 * A menu class to control menu items and their state
 */
export class PrioritizedMenu<T = void> extends AbstractMenu {
    protected categoryConfig: TRequired<IPrioritizedMenuCategoryConfig<T>>;

    // Batching tracking
    protected batchTimeout: NodeJS.Timeout | undefined;
    protected generators: GeneratorStreamExtractor<IPrioritizedMenuItem<T>>[] = [];
    protected menuChangeEvents = {added: [] as IMenuItem[], removed: [] as IMenuItem[]};

    // Tracking menu items
    protected categoriesRaw = [
        {
            items: createSortedList(this.menuChangeEvents),
            category: undefined,
        },
    ] as CategoryData<T>[];
    protected categories = new Field([] as IMenuCategoryData[]);
    protected items = new Field([] as IMenuItem[]); // Flat structure containing items (as IMenuItems) and categories headers (as IMenuItems)

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param categoryConfig The configuration for category options
     */
    public constructor(
        context: IIOContext,
        categoryConfig?: IPrioritizedMenuCategoryConfig<T>
    ) {
        super(context);
        // Create the category config
        this.categoryConfig = {
            getCategory: categoryConfig?.getCategory || getMenuCategory,
            sortCategories: categoryConfig?.sortCategories || sortPrioritizedCategories,
            maxCategoryItemCount: categoryConfig?.maxCategoryItemCount || Infinity,
            batchInterval: categoryConfig?.batchInterval || 100,
        };
    }

    // Item management
    /**
     * Adds an item to the menu
     * @param item The item to be added
     */
    public addItem(item: IPrioritizedMenuItem<T>): void {
        if (item.priority == 0) return;

        // Create a hook to move the item when the category is updated
        const categoryChangeCallback = createCallbackHook(() => {
            const inMenu = this.categoriesRaw[categoryIndex]?.items.find(item) != -1;
            const categoryChanged = category != this.categoryConfig.getCategory(item);
            // In addition, updating the category is only supported if the item provided an ID
            if (inMenu && item.id && categoryChanged) {
                this.removeItem(
                    item as IPrioritizedMenuItem<T> & {id: number | string},
                    category
                );
                this.addItem(item);
            } else this.categoryConfig.getCategory(item, categoryChangeCallback);
        });

        // Obtain the category
        const category = this.categoryConfig.getCategory(item, categoryChangeCallback);
        let categoryIndex = this.categoriesRaw.findIndex(
            ({category: c}) => c == category
        );

        // Add the item to a new or existing category
        if (categoryIndex == -1) {
            categoryIndex = this.categoriesRaw.length;
            this.categoriesRaw.push({
                category,
                items: createSortedList(this.menuChangeEvents),
                batch: {
                    remove: [],
                    add: [item],
                },
            });
        } else {
            const categoryData = this.categoriesRaw[categoryIndex];
            if (!categoryData.batch) categoryData.batch = {add: [], remove: []};

            // If the batch contains an outdated version, remove it
            const index = categoryData.batch.add.findIndex(({id}) => id && id == item.id);
            if (index != -1) categoryData.batch.add.splice(index, 1);

            // Update the new version
            categoryData.batch.add.push(item);
        }

        // Schedule an update if required
        this.scheduleUpdate();
    }

    /**
     * Adds all items from a generator to the the menu
     * @param generator The generator to get the items from
     * @returns The generator extractor, in order to pause execution
     */
    public addItems(
        generator: IGenerator<IPrioritizedMenuItem<T>>
    ): GeneratorStreamExtractor<IPrioritizedMenuItem<T>> {
        const extractor = new GeneratorStreamExtractor(generator, item =>
            this.addItem(item)
        );

        // Adds the extractor to the generator list
        this.generators.push(extractor);
        extractor.start().then(() => {
            const index = this.generators.indexOf(extractor);
            if (index != -1) {
                this.generators.splice(index, 1);
                // Force an update if we are no longer loading
                if (this.generators.length == 0) this.items.set(this.items.get(null));
            }
        });

        // Force an update if we just started loading items
        if (this.generators.length == 1) this.items.set(this.items.get(null));

        // Return the extractor
        return extractor;
    }

    /**
     * Removes the given item from the menu if present
     * @param oldCategory The category that item was in (null to use the items' latest category)
     * @param item The item to remove
     */
    public removeItem(
        item: IPrioritizedMenuItem<T> & {id: string | number},
        oldCategory: ICategory | null = null
    ): void {
        const category =
            oldCategory != null ? oldCategory : this.categoryConfig.getCategory(item);
        const categoryIndex = this.categoriesRaw.findIndex(
            ({category: c}) => c == category
        );

        // Add the item to a new or existing category
        if (categoryIndex == -1) {
            this.categoriesRaw.push({
                category,
                items: createSortedList(this.menuChangeEvents),
                batch: {
                    add: [],
                    remove: [item],
                },
            });
        } else {
            const categoryData = this.categoriesRaw[categoryIndex];
            if (!categoryData.batch) categoryData.batch = {add: [], remove: []};
            categoryData.batch.remove.push(item);
        }

        // Schedule an update if required
        this.scheduleUpdate();
    }

    /**
     * Updates the contents based on the given data, removing any items that don't match
     * @param data The filter to use
     * @returns A promise that resolves once updated
     */
    public async updateContents(data: T): Promise<void> {
        const promises = this.categoriesRaw.map(async categoryData => {
            const items = categoryData.items.get();
            const newItems = [] as IPrioritizedMenuItem<T>[];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const newPriority = await item.getUpdatedPriority?.(data);
                if (newPriority) newItems.push({...(item as any), priority: newPriority});
            }
            categoryData.batch = {
                add: newItems,
                remove: [],
                clear: true,
            };
        });
        await Promise.all(promises);
        this.scheduleUpdate();
    }

    /**
     * Schedules an items data update
     */
    protected scheduleUpdate(): void {
        if (!this.batchTimeout)
            this.batchTimeout = setTimeout(() => {
                this.flushBatch();
            }, this.categoryConfig.batchInterval);
    }

    /**
     * Adds the batch items to the categories, and updates the items list afterwards
     */
    public flushBatch(): void {
        if (!this.batchTimeout) return;
        clearTimeout(this.batchTimeout);
        this.batchTimeout = undefined;
        this.categoriesRaw = this.categoriesRaw.filter(categoryData => {
            if (categoryData.batch) {
                // Reset the category if specified
                if (categoryData.batch.clear)
                    categoryData.items = createSortedList(this.menuChangeEvents);

                // Filters out old items
                const keys = {} as {[key: string]: boolean};
                categoryData.batch.add.forEach(({id}) => id && (keys[id] = true));
                categoryData.batch.remove.forEach(({id}) => id && (keys[id] = true));
                categoryData.items.filter(({id}) => !id || !keys[id]);

                // Adds the new items
                categoryData.items.add(
                    categoryData.batch.add,
                    this.categoryConfig.maxCategoryItemCount
                );

                // Resets the batch and decide whether to keep the category
                categoryData.batch = undefined;
                return categoryData.items.get().length > 0;
            }
            return true;
        });
        this.updateItemsList();
    }

    /**
     * Synchronizes the item list to be up to date with the categories data
     */
    protected updateItemsList(): void {
        const order = this.categoryConfig.sortCategories(this.categoriesRaw);

        // Combine the items and categories into a single list
        const items = [] as IMenuItem[];
        const categories = [] as IMenuCategoryData[];
        order.forEach(category => {
            const categoryData = this.categoriesRaw.find(
                ({category: c}) => c == category
            );
            const categoryItems = categoryData?.items.get().map(({item}) => item);
            if (categoryItems) {
                categories.push({category, items: categoryItems});
                if (category) items.push(category.item, ...categoryItems);
                else items.push(...categoryItems);
            }
        });
        this.categories.set(categories);
        this.items.set(items);
        this.deselectRemovedItems();

        // Fire the menu change events
        onMenuChangeAction.get(this.menuChangeEvents.added).onMenuChange(this, true);
        this.menuChangeEvents.added = [];
        onMenuChangeAction.get(this.menuChangeEvents.removed).onMenuChange(this, false);
        this.menuChangeEvents.removed = [];
    }

    /**
     * Checks whether the selected items are still present, and deselects them if not
     */
    protected deselectRemovedItems(): void {
        const items = this.items.get(null);
        const selected = this.selected.get(null);
        const remaining = selected.filter(item => items.includes(item));
        if (selected.length != remaining.length) {
            this.selected.set(remaining);
        }

        // Sets the current cursor if there isn't any yet
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
        this.flushBatch();
        super.setSelected(item, selected);
    }

    /**
     * Selects an item to be the cursor
     * @param item The new cursor
     */
    public setCursor(item: IMenuItem | null): void {
        this.flushBatch();
        super.setCursor(item);
    }

    /**
     * Destroys the menu, making sure that all items are unselected
     */
    public destroy(): boolean {
        if (super.destroy()) {
            this.generators.forEach(generator => generator.stop());
            onSelectAction.get(this.selected.get(null)).onSelect(false, this);
            const cursor = this.cursor.get(null);
            if (cursor) onCursorAction.get([cursor]).onCursor(false, this);
            return true;
        }
        return false;
    }

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        if (this.generators.length > 0 && hook && "markIsLoading" in hook)
            hook.markIsLoading?.();
        return this.items.get(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook: IDataHook = null): IMenuCategoryData[] {
        if (this.isDestroyed(hook)) return [];
        if (this.generators.length > 0 && hook && "markIsLoading" in hook)
            hook.markIsLoading?.();
        return this.categories.get(hook);
    }
}
