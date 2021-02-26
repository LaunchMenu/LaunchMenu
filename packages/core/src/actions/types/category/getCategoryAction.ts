import {IDataHook} from "model-react";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {IPrioritizedMenuItem} from "../../../menus/menu/_types/IPrioritizedMenuItem";
import {createAction} from "../../createAction";
import {ICategory} from "./_types/ICategory";

/**
 * An action to get the category an item is in
 */
export const getCategoryAction = createAction({
    name: "getCategoryAction",
    core: (categories: (ICategory | undefined)[]) => ({
        result: categories.filter((c): c is ICategory => !!c),
    }),
    extras: {
        /**
         * Retrieve the category for a given item
         * @param item The item to get the category of
         * @param hook The data hook to subscribe to changes
         * @returns The category
         */
        getCategory(
            item: IMenuItem | IPrioritizedMenuItem,
            hook?: IDataHook
        ): ICategory | undefined {
            if ("priority" in item) item = item.item;
            const categories = getCategoryAction.get([item], hook);
            return categories[categories.length - 1];
        },
    },
});
