import {IDataHook, IDataRetriever, isDataLoadRequest} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {DataCacher} from "../../utils/modelReact/DataCacher";
import {TRequired} from "../../_types/TRequired";
import {getMenuCategory} from "../actions/types/category/getCategoryAction";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {isItemSelectable} from "../items/isItemSelectable";
import {IMenuItem} from "../items/_types/IMenuItem";
import {AbstractMenu} from "./AbstractMenu";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";

// TODO: properly call on menu add and remove hook
// TODO: get rid write test file

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
        this.categoryConfig = {
            getCategory: config?.getCategory || getMenuCategory,
            sortCategories:
                config?.sortCategories ||
                (categories => categories.map(({category}) => category)),
            maxCategoryItemCount: config?.maxCategoryItemCount || Infinity,
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
                this.deselectRemovedCursor();
            },
        }
    );

    /**
     * Checks whether the cursor item is still present, and deselects it if not
     */
    protected deselectRemovedCursor(): void {
        const items = this.getItems();
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

    // Item retrieval
    /**
     * Retrieves the items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        return this.itemsList.get(hook);
    }

    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook: IDataHook = null): IMenuCategoryData[] {
        if (this.isDestroyed(hook)) return [];
        return this.categories.get(hook).categories;
    }
}
