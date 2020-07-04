import {getCategoryAction} from "./getCategoryAction";
import {ICategory} from "./_types/ICategory";

/**
 * A handler to retrieve the category directly from an item
 */
export const getCategoryHandler = getCategoryAction.createHandler(
    (categories: ICategory[]) => categories
);
