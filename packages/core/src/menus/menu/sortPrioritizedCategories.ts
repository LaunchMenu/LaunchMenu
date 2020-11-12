import {SortedList} from "../../utils/SortedList";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";
import {hasHigherOrEqualPriority} from "./priority/hasHigherOrEqualPriority";
import {ICategory} from "../../actions/types/category/_types/ICategory";

/**
 * Sorts the given categories based on the top priority of each of the categories
 * @param categories The categories to sort
 * @returns The sorted sequence of categories
 */
export function sortPrioritizedCategories(
    categories: {
        category: ICategory | undefined;
        items: SortedList<IPrioritizedMenuItem>;
    }[]
): (ICategory | undefined)[] {
    const categoryData = categories
        .filter(({category}) => category)
        .map(({category, items}) => ({
            category,
            priority: items.get()[0]?.priority || 0,
        }));
    categoryData.sort((a, b) => -hasHigherOrEqualPriority(a.priority, b.priority));
    return [undefined, ...categoryData.map(({category}) => category)];
}
