import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {hasHigherOrEqualPriority} from "../priority/hasHigherOrEqualPriority";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IIOContext} from "../../../context/_types/IIOContext";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";

/**
 * Creates a standard prioritized menu category sorter
 * @param context The IO context to get the settings from
 * @returns The category sorter
 */
export function createPrioritizedCategoriesSorter(
    context: IIOContext
): {
    /**
     * Sorts the given categories based on the top priority of each of the categories
     * @param categories The categories to sort
     * @returns The sorted sequence of categories
     */
    (
        categories: {
            category: ICategory | undefined;
            items: {item: IPrioritizedMenuItem; index: number}[];
        }[]
    ): (ICategory | undefined)[];
} {
    const menuSettings = context.settings.get(baseSettings).menu;
    return categories => {
        const sortType = menuSettings.categoryOrder.get();
        const categoryData = categories
            .filter(({category}) => category)
            .map(({category, items}) => {
                return {
                    category,
                    priority:
                        items[
                            sortType == "first"
                                ? 0
                                : sortType == "middle"
                                ? Math.floor(items.length / 2)
                                : items.length - 1
                        ]?.index ?? 0,
                };
            });
        categoryData.sort((a, b) =>
            hasHigherOrEqualPriority(a.priority, b.priority) ? 1 : -1
        );
        return [undefined, ...categoryData.map(({category}) => category)];
    };
}
