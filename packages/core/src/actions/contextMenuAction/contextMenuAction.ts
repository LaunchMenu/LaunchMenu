import {IDataHook} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {getCategoryAction} from "../../menus/actions/types/category/getCategoryAction";
import {getContextCategory} from "../../menus/categories/createContextCategory";
import {adjustBindings} from "../../menus/items/adjustBindings";
import {ProxiedPrioritizedMenu} from "../../menus/menu/ProxiedPrioritizedMenu";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {getHooked} from "../../utils/subscribables/getHooked";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createAction} from "../createAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IActionTarget} from "../_types/IActionTarget";
import {IContextMenuItemData} from "./_types/IContextMenuItemData";

type IContextItemNode = IContextMenuItemData & {
    itemCount: number;
    bindingCount: number;
    children: IContextItemNode[];
};

export const contextMenuAction = createAction({
    name: "contextMenuAction",
    core: (items: IContextMenuItemData[]) => ({result: items}),

    /**
     * Retrieves all the context items for the given targets
     * @param items The items to retrieve the context items from
     * @param extraBindings Extra bindings that shouldn't contribute to the itemCount, but should be used to show items in the menu
     * @param hook A hook to subscribe to changes
     * @returns The context items
     */
    getItems(
        items: IActionTarget[],
        extraBindings: ISubscribable<IActionBinding<IAction>[]> = [],
        hook?: IDataHook
    ): IPrioritizedMenuItem[] {
        const totalItemCount = items.length;
        const allTargets = [...items, {actionBindings: extraBindings}];
        const contextItemsData = contextMenuAction.get(allTargets, hook);

        // Get the number of items that have a binding for each context item
        const contextItemsDataWithCounts = contextItemsData.map(contextItem => {
            const itemsWithBinding = items
                .map(item =>
                    getHooked(item.actionBindings, hook).filter(
                        ({action}) => action == contextItem.action
                    )
                )
                .filter(bindings => bindings.length > 0);
            const bindings = itemsWithBinding.flat();

            // If the context item has no action, we know it must have been created from at least 1 binding
            const min = contextItem.action ? 0 : 1;

            return {
                ...contextItem,
                itemCount: itemsWithBinding.length || min,
                bindingCount: bindings.length || min,
            };
        });

        // Compute the children of each action
        const contextItemsDataWithChildren: IContextItemNode[] = contextItemsDataWithCounts.map(
            contextItem => ({...contextItem, children: []})
        );
        contextItemsDataWithChildren.forEach(child => {
            const parent = (child.parent =
                child.parent !== undefined
                    ? child.parent
                    : child.action?.parents.filter(a => a != contextMenuAction)[0]);
            if (parent) {
                const parentNode = contextItemsDataWithChildren.find(
                    ({action}) => parent == action
                );
                if (parentNode) parentNode.children.push(child);
            }
        });

        // Compute root items (items without parents)
        const roots = contextItemsDataWithChildren.filter(({parent}) => !parent);
        const contextItems = roots.map(root => {
            // Obtain the furthest decent that covers all the bindings
            let executeBinding = root.execute;
            let node = root;
            while (node.children.length == 1 && node.bindingCount == 0) {
                node = node.children[0];
                executeBinding = node.execute || executeBinding;
            }

            // Obtain the prioritized item to display
            const item =
                node.item instanceof Function ? node.item(executeBinding) : node.item;

            // Add the item count category if needed
            return node.preventCountCategory || node.itemCount >= totalItemCount
                ? item
                : getItemWithCountCategory(item, node.itemCount, totalItemCount);
        });

        return contextItems;
    },

    /**
     * Retrieves the context menu for the given selection of items, which automatically updates on changes
     * @param items The items to get the context menu for
     * @param context The IOContext that the context menu can use
     * @returns The menu
     */
    getMenu(items: IActionTarget[], context: IIOContext): ProxiedPrioritizedMenu {
        // Create the source for the context items
        const contextItems = (h: IDataHook) => {
            const extraBindings: IActionBinding[] = []; // TODO: obtain the extra bindings from context
            return contextMenuAction.getItems(items, extraBindings, h);
        };

        return new ProxiedPrioritizedMenu(context, contextItems);
    },
});

/**
 * Obtains the prioritized menu item with the selection count as a category
 * @param prioritizedItem The item to add the count category to
 * @param count The number of items that have a binding for this item
 * @param total The total number of items
 * @returns The item with the category
 */
function getItemWithCountCategory(
    prioritizedItem: IPrioritizedMenuItem,
    count: number,
    total: number
): IPrioritizedMenuItem {
    return {
        ...prioritizedItem,
        item: {
            ...prioritizedItem.item,
            actionBindings: adjustBindings(
                prioritizedItem.item.actionBindings,
                bindings => [
                    getCategoryAction.createBinding(getContextCategory(count, total)),
                    ...bindings,
                ]
            ),
        },
    };
}
