import {IMenuItem} from "../../_types/IMenuItem";
import {ICategory} from "../../category/_types/ICategory";
import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {SortedList} from "../../../utils/SortedList";

/**
 * Configuration for the categories in an async menu
 */
export type IASyncMenuCategoryConfig = {
    /**
     * Retrieves a category menu item
     * @param item The item and priority to obtain the category of
     * @returns The category to group this item under, if any
     */
    getCategory(item: IPrioritizedMenuItem): ICategory | undefined;

    /**
     * Retrieves the order of the categories
     * @param categories The categories to sort with relevant data
     * @returns The order of the categories
     */
    sortCategories(
        categories: {
            /** The category */
            category: ICategory;
            /** The items in this category */
            items: SortedList<IPrioritizedMenuItem>;
            /** The average priority of items in this category */
            averagePriority: number;
        }[]
    ): ICategory[];

    /**
     * The maximum number of items per category
     */
    maxCategoryItemCount?: number;
};
