import {Action} from "../actions/Action";
import {IActionHandlerItems} from "../actions/_types/IActionHandlerItems";
import {ICategory} from "./_types/ICategory";
import {IMenuItem} from "../items/_types/IMenuItem";

/**
 * An action to get the category an item is in
 */
export const getCategoryAction = new Action(
    (handlers: IActionHandlerItems<ICategory[]>) => {
        const categories = [] as {category: ICategory; item: IMenuItem}[];
        handlers.forEach(({handler, data, items}) => {
            categories.push(
                ...handler.get(data).map((c, i) => ({category: c, item: items[i]}))
            );
        });
        return categories;
    }
);

/**
 * Retrieves the category of an item using the get category action
 * @param item The item to retrieve the category for
 * @returns The first category the item is in, if any
 */
export function getMenuCategory(item: IMenuItem): ICategory | undefined {
    return getCategoryAction.get([item])[0]?.category;
}
