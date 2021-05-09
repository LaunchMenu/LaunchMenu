import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {
    getConnectionGroupAction,
    standardConnectionGroup,
} from "../../actions/types/connectionGroup/getConnectionGroupAction";
import {executeAction} from "../../actions/types/execute/executeAction";
import {menuItemIdentityAction} from "../../actions/types/identity/menuItemIdentityAction";
import {shortcutHandler} from "../../actions/types/keyHandler/shortcutHandler";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {adjustBindings} from "./adjustBindings";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardActionBindingData} from "./_types/IStandardActionBindingData";
import {scrollableContentHandler} from "../../actions/types/content/scrollableContentHandler";
import {simpleSearchHandler} from "../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IStandardActionBindingExtraData} from "./_types/IStandardActionBindingExtraData";
import {createElement, Fragment} from "react";
import {getTextAction} from "../../actions/types/text/getTextAction";

/**
 * Creates standard subscribable action bindings
 * @param data The standard binding data
 * @param item The function to retrieve the item
 * @param connectionGroup The connection group for the UI (the group to connect with other items with the same group at the top or bottom)
 * @returns The subscribable bindings
 */
export function createStandardActionBindings(
    {
        name,
        description,
        tags,
        category,
        shortcut,
        content,
        searchPattern,
        actionBindings,
        identityActionBindings,
        onExecute,
        onSelect,
        onCursor,
        onMenuChange,
        searchChildren,
        onShowChild: showChild,
    }: IStandardActionBindingData,
    item: () => IMenuItem,
    {
        connectionGroup = {
            top: standardConnectionGroup,
            bottom: standardConnectionGroup,
        },
        includeSearch = true,
    }: IStandardActionBindingExtraData = {}
): ISubscribable<IActionBinding[]> {
    const identity = menuItemIdentityAction.createBinding(item);
    const generatedBindings: IActionBinding[] = [
        identity,
        getTextAction.createBinding({name, description, tags}),
    ];

    if (includeSearch)
        generatedBindings.push(
            simpleSearchHandler.createBinding({
                name,
                description,
                patternMatcher: searchPattern,
                tags,
                children: searchChildren,
                itemID: identity.ID,
                showChild,
            })
        );

    if (onExecute) generatedBindings.push(executeAction.createBinding(onExecute));
    if (onSelect) generatedBindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding(onCursor));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding(onMenuChange));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (content) generatedBindings.push(scrollableContentHandler.createBinding(content));
    if (shortcut)
        generatedBindings.push(
            shortcutHandler.createBinding({shortcut, itemID: identity.ID})
        );
    if (connectionGroup)
        generatedBindings.push(getConnectionGroupAction.createBinding(connectionGroup));

    // Combine the input action bindings with the created ones
    let bindings: ISubscribable<IActionBinding[]> = generatedBindings;
    if (actionBindings) bindings = adjustBindings(actionBindings, generatedBindings);
    if (identityActionBindings) {
        const additionalBindings = identityActionBindings(identity.ID);
        bindings = adjustBindings(bindings, (bindings, hook) => [
            ...getHooked(additionalBindings, hook),
            ...bindings,
        ]);
    }

    return bindings;
}
