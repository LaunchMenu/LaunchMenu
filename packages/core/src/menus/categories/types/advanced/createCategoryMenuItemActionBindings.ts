import {getCategoryAction} from "../../../../actions/types/category/getCategoryAction";
import {
    getConnectionGroupAction,
    standardConnectionGroup,
} from "../../../../actions/types/connectionGroup/getConnectionGroupAction";
import {createElement, Fragment} from "react";
import {createStandardActionBindings} from "../../../items/createStandardActionBindings";
import {IStandardActionBindingData} from "../../../items/_types/IStandardActionBindingData";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";
import {IActionBinding} from "../../../../actions/_types/IActionBinding";
import {adjustBindings} from "../../../items/adjustBindings";
import {menuItemIdentityAction} from "../../../../actions/types/identity/menuItemIdentityAction";
import {simpleSearchHandler} from "../../../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {ICategory} from "../../../../actions/types/category/_types/ICategory";
import {IStandardActionBindingExtraData} from "../../../items/_types/IStandardActionBindingExtraData";
import {dummyItemHandler} from "../../../../actions/types/connectionGroup/dummyItemHandler";

/**
 * Creates subscribable action bindings for an advanced category menu item
 * @param data The standard binding data
 * @param category The function to retrieve the category
 * @param connectionGroup The connection group for the UI (the group to connect with other items with the same group at the top or bottom)
 * @returns The subscribable bindings
 */
export function createCategoryMenuItemActionBindings(
    config: IStandardActionBindingData,
    category: () => ICategory,
    {
        connectionGroup = {
            top: undefined,
            bottom: standardConnectionGroup,
        },
        includeSearch = true,
    }: IStandardActionBindingExtraData = {}
): ISubscribable<IActionBinding[]> {
    // Extract some presentation data
    const {
        name,
        description,
        searchPattern,
        tags,
        searchChildren,
        onShowChild: showChild,
    } = config;

    // Create standard bindings
    const standardBindings = createStandardActionBindings(config, () => category().item, {
        connectionGroup,
        includeSearch: false,
    });

    if (includeSearch) {
        // Add a search action that returns a dummy item without UI that has the specified category as its category
        const dummyIdentity = menuItemIdentityAction.createBinding(() => ({
            view: () => createElement(Fragment),
            actionBindings: [
                dummyItemHandler.createBinding(),
                getCategoryAction.createBinding(category()),
            ],
        }));
        const searchBinding = simpleSearchHandler.createBinding({
            name,
            description,
            patternMatcher: searchPattern,
            tags,
            children: searchChildren,
            itemID: dummyIdentity.ID,
            showChild,
        });

        return adjustBindings(standardBindings, (bindings, hook) => [
            ...bindings,
            dummyIdentity,
            searchBinding,
        ]);
    }

    return standardBindings;
}
