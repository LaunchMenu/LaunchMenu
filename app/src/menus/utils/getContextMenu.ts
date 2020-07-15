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
        skip: boolean;
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
                    foundActions.push({action: itemAction, items: [item], skip: false});
                }

                // Go to the next item action
                itemAction = itemAction.ancestors[itemAction.ancestors.length - 1];
            }
        });
    });

    // Sort the actions such that deeper actions are handler first
    foundActions.sort((a, b) => b.items.length - a.items.length);

    // Go through all actions and collect them in a menu
    return new Menu(
        foundActions
            .map(({action, items: actionItems, skip}) => {
                // Retrieve the item
                const item =
                    !skip &&
                    (action.get(actionItems).getMenuItem?.(close) as
                        | IMenuItem
                        | undefined);

                // If the action has an item and has full coverage, or should be skipped, its parent should be skipped
                if ((item && count == actionItems.length) || skip) {
                    const parent = action.ancestors[action.ancestors.length - 1];
                    if (parent) {
                        const actionData = foundActions.find(
                            ({action}) => action == parent
                        );
                        if (actionData) actionData.skip = true;
                    }
                }

                // If there is no item, or the item should be skipped return nothing
                if (!item || skip) return;

                // Pass a category, which labels actions with partial coverage
                if (actionItems.length != count) {
                    const category = getContextCategory(actionItems.length, count);
                    item.actionBindings.push(getCategoryAction.createBinding(category));
                }

                // Return the item
                return item;
            })
            .filter(item => item) as IMenuItem[]
    );
}
