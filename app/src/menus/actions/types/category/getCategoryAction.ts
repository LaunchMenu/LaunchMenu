import {Action} from "../../Action";
import {ICategory} from "./_types/ICategory";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {IPrioritizedMenuItem} from "../../../menu/_types/IPrioritizedMenuItem";
import {IDataHook} from "model-react";

/**
 * An action to get the category an item is in
 */
export const getCategoryAction = new Action(
    (categories: ICategory[], items: IMenuItem[][]) => {
        // Group all categories such that the resulting array contains no duplicate categories
        const categoriesData = [] as {category: ICategory; items: IMenuItem[]}[];
        categories.forEach((category, index) => {
            const categoryItems = items[index];
            const categoryData = categoriesData.find(({category: c}) => c == category);

            if (categoryData) categoryData.items.push(...categoryItems);
            else categoriesData.push({category, items: categoryItems});
        });

        // Return all the grouped categories
        return categoriesData;
    },
    []
);

/**
 * Retrieves the category of an item using the get category action
 * @param item The item to retrieve the category for
 * @param hook The hook to subscribe to changes
 * @returns The first category the item is in, if any
 */
export function getMenuCategory(
    item: IMenuItem | IPrioritizedMenuItem<any>,
    hook?: IDataHook
): ICategory | undefined {
    if ("priority" in item) item = item.item;
    return getCategoryAction.get([item], hook)[0]?.category;
}
