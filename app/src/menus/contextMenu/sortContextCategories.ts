import {SortedList} from "../../utils/SortedList";
import {ICategory} from "../actions/types/category/_types/ICategory";
import {sortPrioritizedCategories} from "../menu/SortPrioritizedCategories";
import {IPrioritizedMenuItem} from "../menu/_types/IPrioritizedMenuItem";
import {IContextCategory} from "./_types/IContextCategory";

/**
 * Sorts the given categories according to how many items are in the context category
 * @param categories The categories to be sorted
 * @param subSort The sub sort function to sort actions that all items in the selection have
 * @returns The sorted categories
 */
export function sortContextCategories(
    categories: {
        category: ICategory | undefined;
        items: SortedList<IPrioritizedMenuItem>;
    }[],
    subSort: (
        categories: {
            /** The category */
            category: ICategory | undefined;
            /** The items in this category */
            items: SortedList<IPrioritizedMenuItem>;
        }[]
    ) => (undefined | ICategory)[] = sortPrioritizedCategories
): (ICategory | undefined)[] {
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
}
