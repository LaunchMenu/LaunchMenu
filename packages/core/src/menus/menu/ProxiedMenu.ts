import {DataCacher, IDataHook, IDataRetriever} from "model-react";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {baseSettings} from "../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../context/_types/IIOContext";
import {TRequired} from "../../_types/TRequired";
import {isItemSelectable} from "../items/isItemSelectable";
import {IMenuItem} from "../items/_types/IMenuItem";
import {AbstractMenu} from "./AbstractMenu";
import {createCategoryGetter} from "./standardConfig/createCategoryGetter";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";

// TODO: properly call on menu add and remove hook
// TODO: write test file

/**
 * A menu that wraps around an item source retriever, automatically updating its contents when the source updates.
 * Note that every single update will require O(n^2) time (n being the number of items in the menu), and is thus rather intensive.
 */
export class ProxiedMenu extends AbstractMenu {
    protected categoryConfig: TRequired<IMenuCategoryConfig>;
    protected itemSource: IDataRetriever<IMenuItem[]>;

    /**
     * Creates a new proxied menu
     * @param context The context to be used by menu items
     * @param itemSource The menu items source
     * @param config The configuration for category options
     */
    public constructor(
        context: IIOContext,
        itemSource: IDataRetriever<IMenuItem[]>,
        config?: IMenuCategoryConfig
    ) {
        super(context);
        this.itemSource = itemSource;
        const menuSettings = context.settings.get(baseSettings).menu;
        this.categoryConfig = {
            getCategory: config?.getCategory || createCategoryGetter(context),
            sortCategories:
                config?.sortCategories ||
                (categories => categories.map(({category}) => category)),
            maxCategoryItemCount:
                config?.maxCategoryItemCount ?? menuSettings.maxMenuSize.get(),
        };
    }

    /** A data cacher that computes the categories from an item list */
    protected categories = new DataCacher(
        hook => {
            const items = this.itemSource(hook);
            const categories = [{category: undefined, items: []}] as IMenuCategoryData[];
            items.forEach(item => {
                const category = this.categoryConfig.getCategory(item, hook);
                const categoryData = categories.find(({category: c}) => c == category);
                if (categoryData) categoryData.items.push(item);
                else categories.push({category, items: [item]});
            });
            return {categories, rawItems: items};
        },

        // Call on menu change actions
        {
            onUpdate: ({rawItems}, prev) => {
                const prevRawItems = prev?.rawItems ?? [];

                const removed = prevRawItems.filter(item => !rawItems.includes(item));
                onMenuChangeAction.get(removed).onMenuChange(this, false);
                const added = rawItems.filter(item => !prevRawItems.includes(item));
                onMenuChangeAction.get(added).onMenuChange(this, true);
            },
        }
    );

    /** A data cacher that computes the items list with categories from the category data */
    protected itemsList = new DataCacher(
        hook => {
            const rawCategories = this.categories.get(hook).categories;
            const order = this.categoryConfig.sortCategories(rawCategories);

            // Combine the items and categories into a single list
            const items = [] as IMenuItem[];
            const categories = [] as IMenuCategoryData[];
            order.forEach(category => {
                const categoryData = rawCategories.find(({category: c}) => c == category);
                if (categoryData) {
                    categories.push({category, items: categoryData.items});
                    if (category) items.push(category.item, ...categoryData.items);
                    else items.push(...categoryData.items);
                }
            });
            return items;
        },
        {
            onUpdate: () => {
                this.deselectRemovedItems();
            },
        }
    );

    /**
     * Checks whether the cursor item is still present, and deselects it if not
     */
    protected deselectRemovedItems(): void {
        const items = this.getItems();

        // Update the cursor if needed
        const cursor = this.cursor.get();
        updateCursor: if (cursor == null || !items.includes(cursor)) {
            for (let i = 0; i < items.length; i++)
                if (isItemSelectable(items[i])) {
                    this.setCursor(items[i]);
                    break updateCursor;
                }
            this.setCursor(null);
        }

        // Remove any removed items from the selection
        const selection = this.selected.get();
        const presentSelected = selection.filter(item => items.includes(item));
        if (selection.length != presentSelected.length) {
            const removed = selection.filter(item => !items.includes(item));
            onSelectAction.get(removed).onSelect(false, this);
            this.selected.set(presentSelected);
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
            return this.itemsList.get();
        return this.itemsList.get(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook?: IDataHook): IMenuCategoryData[] {
        if (this.isDestroyed(hook))
            // Whenever the menu is destroyed, we no longer inform about category changes
            return this.categories.get().categories;
        return this.categories.get(hook).categories;
    }
}
