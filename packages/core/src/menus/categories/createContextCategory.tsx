import React, {memo} from "react";
import {IContextCategory} from "../../actions/contextMenuAction/_types/IContextCategory";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {Box} from "../../styling/box/Box";

/**
 * Creates a new context menu category, based on the number of items that have the action in this category
 * @param count The number of items that has the actions in this category
 * @param totalCount The total number of items for the context menu
 * @returns The context menu category
 */
export function createContextCategory(
    count: number,
    totalCount: number
): IContextCategory {
    return {
        count,
        name: `Context menu category ${count}/${totalCount}`,
        description:
            "The category for context menu items indicating how many are correct",
        item: {
            view: memo(props => (
                <MenuItemFrame {...props} transparent={true}>
                    <MenuItemLayout
                        name={
                            <Box font="header">
                                {count}/{totalCount}
                            </Box>
                        }
                    />
                </MenuItemFrame>
            )),
            actionBindings: [],
        },
    };
}

const cached: {[count: number]: {[totalCount: number]: IContextCategory}} = {};
/**
 * Creates a new context menu category for the given params if not present yet, or returns it from the cache otherwise
 * @param count The number of items that has the actions in this category
 * @param totalCount The total number of items for the context menu
 * @returns The context menu category
 */
export function getContextCategory(count: number, totalCount: number): IContextCategory {
    // Try to retrieve the category from the cache
    const fromCache = cached[count]?.[totalCount];
    if (fromCache) return fromCache;

    // Create the new category and add it to the cache
    const newCategory = createContextCategory(count, totalCount);
    if (!cached[count]) cached[count] = {};
    cached[count][totalCount] = newCategory;

    // Return the new category
    return newCategory;
}
