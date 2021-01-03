import {IDataHook} from "model-react";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * The configuration for the categorizer
 */
export type ICategorizerConfig<T> = {
    /** A callback to get the category for a given item */
    readonly getCategory: {
        /**
         * Retrieves a category menu item
         * @param item The item and priority to obtain the category of
         * @param hook The hook to subscribe to changes
         * @returns The category to group this item under, if any
         */
        (item: T, hook?: IDataHook): ICategory | undefined;
    };

    /** A callback to sort the categories */
    readonly sortCategories: {
        /**
         * Retrieves the order of the categories
         * @param categories The categories to sort with relevant data
         * @param hook The hook to subscribe to changes
         * @returns The order of the categories
         */
        (
            categories: {
                /** The category */
                category: ICategory | undefined;
                /** The items in this category */
                items: {item: T; index: number}[];
            }[],
            hook?: IDataHook
        ): (undefined | ICategory)[];
    };

    /** A callback to normalize the item to a menu item */
    readonly getItem: {
        /**
         * Retrieves the menu item given an item in the requested format
         * @param item The item in the original format
         * @param hook The hook to subscribe to changes
         * @returns The normalized menu item
         */
        (item: T, hook: IDataHook): IMenuItem;
    };
};
