import {Field, IDataHook} from "model-react";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {baseSettings} from "../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../context/_types/IIOContext";
import {createCallbackHook} from "../../utils/createCallbackHook";
import {SortedList} from "../../utils/SortedList";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IUUID} from "../../_types/IUUID";
import {TRequired} from "../../_types/TRequired";
import {isItemSelectable} from "../items/isItemSelectable";
import {IMenuItem} from "../items/_types/IMenuItem";
import {AbstractMenu} from "./AbstractMenu";
import {MenuItemCategorizer} from "./MenuItemCategorizer";
import {hasHigherOrEqualPriority} from "./priority/hasHigherOrEqualPriority";
import {Priority} from "./priority/Priority";
import {createCategoryGetter} from "./standardConfig/createCategoryGetter";
import {createPrioritizedCategoriesSorter} from "./standardConfig/createPrioritizedCategoriesSorter";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {IPrioritizedMenuConfig} from "./_types/IPrioritizedMenuConfig";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";

type IBatchData = {
    add: Set<IPrioritizedMenuItem>;
    addIDs: Map<IUUID, IPrioritizedMenuItem>;
    remove: Set<IPrioritizedMenuItem>;
    removeIDs: Map<IUUID, IPrioritizedMenuItem>;
};

/**
 * A prioritized menu
 */
export class PrioritizedMenu extends AbstractMenu {
    protected config: TRequired<IPrioritizedMenuConfig>;

    protected items: SortedList<IPrioritizedMenuItem>;
    protected categorizer: MenuItemCategorizer<IPrioritizedMenuItem>;

    // Batching tracking
    protected batchTimeout: NodeJS.Timeout | null = null;
    protected batch: IBatchData = {
        add: new Set(),
        addIDs: new Map(),
        remove: new Set(),
        removeIDs: new Map(),
    };
    protected maxCountHookDestroyer?: () => void;
    protected menuChangeEvents = {added: [] as IMenuItem[], removed: [] as IMenuItem[]};

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param config The configuration for category options
     */
    public constructor(context: IIOContext, config?: IPrioritizedMenuConfig);

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param items The initial items to store
     * @param config The configuration for category options
     */
    public constructor(
        context: IIOContext,
        items: IPrioritizedMenuItem[],
        config?: IPrioritizedMenuConfig
    );
    public constructor(
        context: IIOContext,
        items: IPrioritizedMenuItem[] | IPrioritizedMenuConfig | undefined,
        config?: IPrioritizedMenuConfig
    ) {
        super(context);
        if (!(items instanceof Array)) config = items;

        // Create the category config
        const menuSettings = context.settings.get(baseSettings).menu;
        this.config = {
            getCategory: config?.getCategory || createCategoryGetter(context),
            sortCategories:
                config?.sortCategories || createPrioritizedCategoriesSorter(context),
            maxItemCount: config?.maxItemCount ?? menuSettings.maxMenuSize.get(), // TODO: change setting to menu instead of category size
            batchInterval: config?.batchInterval || 100,
            isLoading: config?.isLoading || new Field(false),
        };

        // Create the list of items
        this.items = new SortedList({
            condition: (a, b) => hasHigherOrEqualPriority(a.priority, b.priority),
            onAdd: ({item}) => this.menuChangeEvents.added.push(item),
            onRemove: ({item}) => this.menuChangeEvents.removed.push(item),
        });

        // Offload categorization
        this.categorizer = new MenuItemCategorizer(h => this.items.get(h), {
            ...this.config,
            getItem: ({item}) => item,
        });

        if (items instanceof Array) this.addItems(items);
    }

    /**
     * Destroys the menu
     */
    public destroy(): boolean {
        this.maxCountHookDestroyer?.();
        return super.destroy();
    }

    // Item management
    /**
     * Adds the given items to the menu
     * @param items The items to be added
     */
    public addItems(items: IPrioritizedMenuItem[]): void {
        items.forEach(item => this.addItem(item));
    }

    /**
     * Adds an item to the menu
     * @param item The item to be added
     */
    public addItem(item: IPrioritizedMenuItem): void {
        // Adds the item to the add queue
        if (item.ID) this.batch.addIDs.set(item.ID, item);
        else this.batch.add.add(item);

        // Remove the item from the remove queue
        if (item.ID) this.batch.removeIDs.delete(item.ID);
        else this.batch.remove.delete(item);

        // Update the menu
        this.scheduleUpdate();
    }

    /**
     * Removes the given items from the menu if present
     * @param items The items to be removed
     */
    public removeItems(items: IPrioritizedMenuItem[]): void {
        items.forEach(item => this.removeItem(item));
    }

    /**
     * Removes the given item from the menu if present
     * @param item The item to remove
     * @param oldCategory The category that item was in (null to use the items' latest category)
     */
    public removeItem(item: IPrioritizedMenuItem): void {
        // Adds the item to the remove queue
        if (item.ID) this.batch.removeIDs.set(item.ID, item);
        else this.batch.remove.add(item);

        // Remove the item from the add queue
        if (item.ID) this.batch.addIDs.delete(item.ID);
        else this.batch.add.delete(item);

        // Update the menu
        this.scheduleUpdate();
    }

    /**
     * Schedules an items data update
     */
    protected scheduleUpdate(): void {
        if (!this.batchTimeout)
            this.batchTimeout = setTimeout(() => {
                this.flushBatch();
            }, this.config.batchInterval);
    }

    /**
     * Flushes the batch to make sure that any items that are queued to be added or removed are added/removed.
     *
     * Note that this also automatically happens with some delay after calling add or remove item.
     */
    public flushBatch(): void {
        if (!this.batchTimeout) return;
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;

        // Remove all removed and updated (/added) items
        const addedItems = [...this.batch.add, ...this.batch.addIDs.values()];
        const filterPrioritizedItems = [
            ...addedItems,
            ...this.batch.remove,
            ...this.batch.removeIDs.values(),
        ];
        const filterItems = new Set(filterPrioritizedItems.map(({item}) => item));
        const filterIDs = new Set([
            ...this.batch.addIDs.keys(),
            ...this.batch.removeIDs.keys(),
        ]);
        this.batch = {
            add: new Set(),
            remove: new Set(),
            addIDs: new Map(),
            removeIDs: new Map(),
        };

        this.items.filter(
            ({ID, item}) => (!ID || !filterIDs.has(ID)) && !filterItems.has(item)
        );

        // Add all updated (/added) items (and listen for max item count changes)
        this.maxCountHookDestroyer?.();
        const [hook, destroyer] = createCallbackHook(() => this.scheduleUpdate());
        this.maxCountHookDestroyer = destroyer;
        this.items.add(
            addedItems.filter(({priority}) => Priority.isPositive(priority)),
            getHooked(this.config.maxItemCount, hook)
        );

        // Fire the menu change events
        onMenuChangeAction.get(this.menuChangeEvents.added).onMenuChange(this, true);
        this.menuChangeEvents.added = [];
        onMenuChangeAction.get(this.menuChangeEvents.removed).onMenuChange(this, false);
        this.menuChangeEvents.removed = [];

        // Deselect the items that were removed
        this.deselectRemovedItems();
    }

    // Selection management
    /**
     * Checks whether the selected items are still present, and deselects them if not
     */
    protected deselectRemovedItems(): void {
        const items = this.items.get().map(({item}) => item);
        const selected = this.selected.get();
        const remaining = selected.filter(item => items.includes(item));
        if (selected.length != remaining.length) {
            this.selected.set(remaining);
        }

        // Sets the current cursor if there isn't any yet
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

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook?: IDataHook): IMenuItem[] {
        if (this.isDestroyed(hook))
            // Whenever the menu is destroyed, we no longer inform about item changes
            return this.categorizer.getItems();

        if (hook && "markIsLoading" in hook && this.config.isLoading.get(hook))
            hook.markIsLoading?.();
        return this.categorizer.getItems(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook?: IDataHook): IMenuCategoryData[] {
        if (this.isDestroyed(hook))
            // Whenever the menu is destroyed, we no longer inform about category changes
            return this.categorizer.getCategories();

        if (hook && "markIsLoading" in hook && this.config.isLoading.get(hook))
            hook.markIsLoading?.();
        return this.categorizer.getCategories(hook);
    }
}
