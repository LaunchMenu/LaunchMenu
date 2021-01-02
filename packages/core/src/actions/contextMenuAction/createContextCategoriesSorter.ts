import {SortedList} from "../../utils/SortedList";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {ICategory} from "../types/category/_types/ICategory";
import {IContextCategory} from "./_types/IContextCategory";
import {IIOContext} from "../../context/_types/IIOContext";
import {createPrioritizedCategoriesSorter} from "../../menus/menu/standardConfig/createPrioritizedCategoriesSorter";

/**
 * Creates a context sort action
 * @param context The context to get settings from
 * @param subSort The sub sort function to sort actions that all items in the selection have
 * @returns The category sorter
 */
export function createContextCategoriesSorter(
    context: IIOContext,
    subSort: (
        categories: {
            /** The category */
            category: ICategory | undefined;
            /** The items in this category */
            items: SortedList<IPrioritizedMenuItem>;
        }[]
    ) => (undefined | ICategory)[] = createPrioritizedCategoriesSorter(context)
): {
    /**
     * Sorts the given categories according to how many items are in the context category
     * @param categories The categories to be sorted
     * @returns The sorted categories
     */
    (
        categories: {
            category: ICategory | undefined;
            items: SortedList<IPrioritizedMenuItem>;
        }[]
    ): (ICategory | undefined)[];
} {
    return categories => {
        // Get the correct order of categories for actions that include all selected items
        const includesAll = categories.filter(
            ({category}) => !category || !("count" in category)
        );
        const sortedAll = subSort(includesAll);

        // Get the correct order of categories of actions that include some selected items
        const includesPartial = categories
            .map(({category}) => category)
            .filter(category => category && "count" in category) as IContextCategory[];
        const sortedPartial = includesPartial.sort(
            ({count: countA}, {count: countB}) => countB - countA
        );

        // Return the combined categories
        return [...sortedAll, ...sortedPartial];
    };
}
