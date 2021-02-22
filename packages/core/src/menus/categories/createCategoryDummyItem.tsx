import React from "react";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {dummyItemHandler} from "../../actions/types/connectionGroup/dummyItemHandler";
import {IMenuItem} from "../items/_types/IMenuItem";

/**
 * Creates a dummy menu item that can be used to make a category show up even if it visually has no items
 * @param config The config
 * @returns The created menu item which doesn't have a visual appearance
 */
export function createCategoryDummyItem({category}: {category: ICategory}): IMenuItem {
    const item = {
        view: () => <></>,
        actionBindings: [
            dummyItemHandler.createBinding(),
            getCategoryAction.createBinding(category),
        ],
    };
    return item;
}
