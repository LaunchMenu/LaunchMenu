import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IPrioritizedMenuItem} from "./IPrioritizedMenuItem";
import {SortedList} from "../../../utils/SortedList";

/**
 * Configuration for the categories in a prioritized menu
 */
export type IPrioritizedMenuCategoryConfig<T> = {
    /**
     * Retrieves a category menu item
     * @param item The item and priority to obtain the category of
     * @returns The category to group this item under, if any
     */
    readonly getCategory?: (item: IPrioritizedMenuItem<T>) => ICategory | undefined;

    /**
     * Retrieves the order of the categories
     * @param categories The categories to sort with relevant data
     * @returns The order of the categories
     */
    readonly sortCategories?: (
        categories: {
            /** The category */
            category: ICategory | undefined;
            /** The items in this category */
            items: SortedList<IPrioritizedMenuItem<T>>;
        }[]
    ) => (undefined | ICategory)[];

    /**
     * The maximum number of items per category
     */
    readonly maxCategoryItemCount?: number;

    /**
     * The interval at which to add the batched items
     */
    readonly batchInterval?: number;
};
