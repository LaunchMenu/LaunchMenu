import {IMenuItem} from "../items/_types/IMenuItem";
import {IAction} from "../actions/_types/IAction";
import {getContextCategory} from "../categories/createContextCategory";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {IContextMenuItemGetter} from "../actions/contextAction/_types/IContextMenuItemGetter";
import {IIOContext} from "../../context/_types/IIOContext";
import {IDataHook} from "model-react";
import {adjustBindings} from "../items/adjustBindings";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IPrioritizedMenuItem} from "../menu/_types/IPrioritizedMenuItem";

/**
 * Retrieves the context items for a context menu for a given item selection
 * @param items The item selection to get the menu for
 * @param ioContext The context that context items can use
 * @param close A function that can be used to close the menu that will be created
 * @param hook The data hook to subscribe to changes
 * @param includeAction The function to determine whether or not to include an action in the menu, defaults to actions with the tag "context"
 * @returns The items
 */
export function getContextMenuItems(
    items: IMenuItem[],
    ioContext: IIOContext,
    close: () => void,
    hook?: IDataHook,
    includeAction: (binding: IActionBinding<any>) => boolean = binding =>
        binding.tags.includes("context")
): IPrioritizedMenuItem[] {
    const count = items.length;
    const foundActions = [] as {
        action: IAction<any, any>;
        items: IMenuItem[];
    }[];

    // Go through all action bindings and collect actions
    items.forEach(item => {
        getHooked(item.actionBindings, hook).forEach(binding => {
            // Make sure the item should show in the menu
            if (!includeAction(binding)) return;

            // Go through all actions this binding responds to
            let itemAction = binding.action;
            while (itemAction) {
                // Aggregate the items for this action
                const foundAction = foundActions.find(({action}) => action == itemAction);
                if (foundAction) {
                    if (!foundAction.items.includes(item)) foundAction.items.push(item);
                } else {
                    foundActions.push({
                        action: itemAction,
                        items: [item],
                    });
                }

                // Go to the next item action
                itemAction = itemAction.ancestors[itemAction.ancestors.length - 1];
            }
        });
    });

    // Get all the menu items
    const foundActionsWithData = foundActions.flatMap(foundAction => {
        let prioritizedActionItem = (foundAction.action.get(foundAction.items)
            ?.getMenuItem as IContextMenuItemGetter | undefined)?.(ioContext, close) as
            | IPrioritizedMenuItem
            | undefined;
        if (!prioritizedActionItem) return [];

        // Augment the prioritized item with a category representing the number of matches
        if (foundAction.items.length < count)
            prioritizedActionItem = {
                ...prioritizedActionItem,
                item: {
                    ...prioritizedActionItem.item,
                    actionBindings: adjustBindings(
                        prioritizedActionItem.item.actionBindings,
                        bindings => [
                            getCategoryAction.createBinding(
                                getContextCategory(foundAction.items.length, count)
                            ),
                            ...bindings,
                        ]
                    ),
                },
            };

        return [
            {
                ...foundAction,
                actionItem: prioritizedActionItem,
                childHitCount: 0,
            },
        ];
    });

    // Set the child hit counts
    foundActionsWithData.forEach(({action, items: actionItems}) => {
        action.ancestors.forEach(ancestor => {
            const ancestorData = foundActionsWithData.find(
                ({action}) => action == ancestor
            );
            if (ancestorData) {
                ancestorData.childHitCount = Math.max(
                    ancestorData.childHitCount,
                    actionItems.length
                );
            }
        });
    });

    // Filter redundant actions
    const filteredActions = foundActionsWithData.filter(
        ({items: actionItems, childHitCount}) => actionItems.length > childHitCount
    );

    console.log(filteredActions);

    // Map the data to the items
    return filteredActions.map(({actionItem}) => actionItem);
}
