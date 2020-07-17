import {Menu} from "../menu/Menu";
import {IMenuItem} from "../items/_types/IMenuItem";
import {IAction} from "../actions/_types/IAction";
import {getContextCategory} from "../categories/createContextCategory";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";

/**
 * Retrieves the context menu for a given list of items
 * @param items The items to get the menu for
 * @param close A function that can be used to close the menu that will be created
 * @returns The menu
 */
export function getContextMenu(items: IMenuItem[], close: () => void): Menu {
    const count = items.length;
    const foundActions = [] as {
        action: IAction<any, any>;
        items: IMenuItem[];
    }[];

    // Go through all action bindings and collect actions
    items.forEach(item => {
        item.actionBindings.forEach(binding => {
            // Make sure the item should show in the menu
            if (!binding.tags.includes("context")) return;

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
    const foundActionsWithData = foundActions
        .map(foundAction => {
            const actionItem = foundAction.action
                .get(foundAction.items)
                .getMenuItem?.(close) as IMenuItem;
            if (foundAction.items.length < count)
                actionItem.actionBindings.push(
                    getCategoryAction.createBinding(
                        getContextCategory(foundAction.items.length, count)
                    )
                );
            return {
                ...foundAction,
                actionItem,
                childHitCount: 0,
            };
        })
        .filter(({actionItem}) => actionItem);

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

    // Go through all actions and collect them in a menu
    return new Menu(filteredActions.map(({actionItem}) => actionItem));
}
