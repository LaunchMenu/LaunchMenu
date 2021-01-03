import {IDataHook, IDataRetriever} from "model-react";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {DataCacher} from "../../utils/modelReact/DataCacher";
import {IMenuItem} from "../items/_types/IMenuItem";
import {ICategorizerConfig} from "./_types/ICategorizerConfig";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";

/**
 * A class that can be used to categorize a list of menu items
 */
export class MenuItemCategorizer<T> {
    protected itemsGetter: IDataRetriever<T[]>;
    protected config: Required<ICategorizerConfig<T>>;

    /**
     * Creates a new categorizer
     * @param items The items getter
     * @param config The config to customize the categories
     */
    public constructor(items: IDataRetriever<T[]>, config: ICategorizerConfig<T>) {
        this.itemsGetter = items;
        this.config = config;
    }

    // The transformers to translate the input items list into a categorized list
    /**
     * The items together with a function to retrieve their category, caching the category for future use
     */
    protected itemsWithCategories = new DataCacher<{
        items: {item: T; categoryGetter: DataCacher<ICategory | undefined>}[];
        categories: Map<T, DataCacher<ICategory | undefined>>;
    }>((hook, prev) => {
        const items = this.itemsGetter(hook);
        const prevCategories = prev?.categories;

        const categories = new Map<T, DataCacher<ICategory | undefined>>();
        const itemsWithCategories = items.map(item => {
            const categoryGetter =
                prevCategories?.get(item) ??
                new DataCacher(h => this.config.getCategory(item, h));
            categories.set(item, categoryGetter);
            return {item, categoryGetter};
        });

        return {items: itemsWithCategories, categories};
    });

    /**
     * The categories data
     */
    protected categories = new DataCacher<IMenuCategoryData[]>(hook => {
        const {items} = this.itemsWithCategories.get(hook);

        // Collect all categories with their items
        const categoriesMap = new Map<
            ICategory | undefined,
            {item: T; index: number}[]
        >();
        items.forEach(({item, categoryGetter}, index) => {
            const category = categoryGetter.get(hook);

            let categoryItems = categoriesMap.get(category);
            if (!categoryItems) {
                categoryItems = [];
                categoriesMap.set(category, categoryItems);
            }

            categoryItems.push({item, index});
        });

        // Sort the categories
        const categoriesList: {
            category: ICategory | undefined;
            items: {item: T; index: number}[];
        }[] = [];
        for (let [category, items] of categoriesMap)
            categoriesList.push({category, items});

        const order = this.config.sortCategories(categoriesList, hook);

        // Extract the simplified category data
        const categories = order.map(category => {
            const items = categoriesMap.get(category) ?? [];
            const normalizedItems = items.map(({item}) =>
                this.config.getItem(item, hook)
            );
            return {category, items: normalizedItems};
        });
        return categories;
    });

    /**
     * The menu items
     */
    protected items = new DataCacher<IMenuItem[]>(hook => {
        const categories = this.categories.get(hook);

        const allItems: IMenuItem[] = [];
        categories.forEach(({category, items}) => {
            if (category) allItems.push(category.item);
            allItems.push(...items);
        });

        return allItems;
    });

    // All the getters
    /**
     * Retrieves the item categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns The categories and their items
     */
    public getCategories(hook: IDataHook = null): IMenuCategoryData[] {
        return this.categories.get(hook);
    }

    /**
     * Retrieves the items including categories
     * @param hook The hook to subscribe to changes
     * @returns The menu items
     */
    public getItems(hook: IDataHook = null): IMenuItem[] {
        return this.items.get(hook);
    }
}
