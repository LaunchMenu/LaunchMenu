import {IDataHook} from "model-react";
import {getContextMenuCategory} from "../../menus/categories/types/getContexMenutCategory";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {getLCS} from "../../utils/getLCS";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createActionGraph} from "../actionGraph/createActionHandlerTree";
import {getCategoryAction} from "../types/category/getCategoryAction";
import {menuItemIdentityAction} from "../types/identity/menuItemIdentityAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IActionNodeWithTargets} from "../_types/IActionNode";
import {IActionTarget} from "../_types/IActionTarget";
import {IIndexedActionBinding} from "../_types/IIndexedActionBinding";
import {IContextMenuItemData} from "./_types/IContextMenuItemData";

export type IOverrideContextItem = {
    node: IContextItemNode;
    contextItem: IContextMenuItemData;
};

export type IContextItemNode = Omit<IActionNodeWithTargets, "children"> & {
    contextItems: IContextMenuItemData[];
    children: IContextItemNode[];
    descendantBindings?: IIndexedActionBinding[];
    descendantTargets?: IActionTarget[];
    descendantContextItems?: Map<IAction, IOverrideContextItem[]>;
};

/**
 * Retrieves all the context items for the given targets
 * @param contextItemData The context item data to collect the final items from
 * @param sourceItems The items to retrieve the context items from
 * @param extraBindings Extra bindings that shouldn't contribute to the itemCount, but should be used to show items in the menu
 * @param hook A hook to subscribe to changes
 * @returns The context items
 */
export function collectContextMenuItems(
    contextItemData: IContextMenuItemData[],
    sourceItems: IActionTarget[],
    extraBindings: ISubscribable<IActionBinding<IAction>[]> = [],
    hook?: IDataHook
): IPrioritizedMenuItem[] {
    const totalItemCount = sourceItems.length;
    const allTargets = [...sourceItems, {actionBindings: extraBindings}];

    // Retrieve the action graph of all bindings, and attach the context items for each action
    const actionGraph = createActionGraph(allTargets, hook, true);
    const nodesWithContextItems = actionGraph.map((node: IContextItemNode) => {
        node.contextItems = contextItemData.filter(({action}) => action == node.action);
        return node;
    });

    const actionContextItems = nodesWithContextItems.flatMap(node =>
        node.contextItems.flatMap(rootCIData => {
            if (rootCIData.override) return []; // Is not a root item

            // Find the most specialized CI item for this subDAG
            const commonContextItems = getCommonDescendantContextItems(node, node.action);
            const mostSpecializedItem = commonContextItems[commonContextItems.length - 1];

            const {contextItem: CI, node: CINode} = mostSpecializedItem;

            // Return the menu item, potentially with category
            const contextItem =
                CI.item instanceof Function ? CI.item(rootCIData.execute) : CI.item;

            const targetCount = getDescendantTargets(CINode).length;
            const skipCategory = CI.preventCountCategory || targetCount == totalItemCount;
            return skipCategory
                ? contextItem
                : getItemWithCountCategory(contextItem, targetCount, totalItemCount);
        })
    );

    // Retrieve the direct context menu bindings, that don't belong to actions
    const extraContextItems = contextItemData
        .filter(({action}) => !action)
        .map(({item, execute, preventCountCategory}) => {
            const contextItem = item instanceof Function ? item(execute) : item;

            const skipCategory = preventCountCategory || 1 == totalItemCount;
            return skipCategory
                ? contextItem
                : getItemWithCountCategory(contextItem, 1, totalItemCount);
        });

    return [...actionContextItems, ...extraContextItems];
}

/**
 * Obtains the prioritized menu item with the selection count as a category
 * @param prioritizedItem The item to add the count category to
 * @param count The number of items that have a binding for this item
 * @param total The total number of items
 * @returns The item with the category
 */
export function getItemWithCountCategory(
    prioritizedItem: IPrioritizedMenuItem,
    count: number,
    total: number
): IPrioritizedMenuItem {
    return {
        ...prioritizedItem,
        item: menuItemIdentityAction.copyItem(prioritizedItem.item, [
            getCategoryAction.createBinding(getContextMenuCategory(count, total)),
        ]),
    };
}

/**
 * Retrieves all descendant (self + recursive children) bindings for a given node, and caches them within the node
 * @param node The node to retrieve the descendant bindings for
 * @returns All the descendant bindings
 */
export function getDescendantBindings(node: IContextItemNode): IIndexedActionBinding[] {
    if (node.descendantBindings) return node.descendantBindings;

    const bindings = [...node.bindings];
    node.children.forEach(node =>
        getDescendantBindings(node).forEach(binding => {
            if (!bindings.includes(binding)) bindings.push(binding);
        })
    );

    // Cache results for efficiency
    node.descendantBindings = bindings;
    return bindings;
}

/**
 * Retrieves all descendant (self + recursive children) targets for a given node, and caches them within the node
 * @param node The node to retrieve the descendant targets for
 * @returns All the descendant targets
 */
export function getDescendantTargets(node: IContextItemNode): IActionTarget[] {
    if (node.descendantTargets) return node.descendantTargets;

    const targets = [...node.targets];
    node.children.forEach(node =>
        getDescendantTargets(node).forEach(target => {
            if (!targets.includes(target)) targets.push(target);
        })
    );

    // Cache results for efficiency
    node.descendantTargets = targets;
    return targets;
}

/**
 * Retrieves all descendant (self + recursive children) context items (CI) for a given node in the order of furthest up to furthest down the tree, such that a CI is only included if it covers all descendant items.
 * It also caches the result within the node
 * @param node The node to retrieve the descendant context items for
 * @param targetAction The action that the found context items should be overrides for
 * @returns All the descendant context items
 */
export function getCommonDescendantContextItems(
    node: IContextItemNode,
    targetAction: IAction
): IOverrideContextItem[] {
    if (node.descendantContextItems?.has(targetAction))
        return node.descendantContextItems.get(targetAction) as IOverrideContextItem[];

    // Obtain the context items for the targetted action of the specified node
    const contextItems = node.contextItems
        .filter(CI => CI.action == targetAction || CI.override == targetAction)
        .map(CI => ({contextItem: CI, node}));

    const bindingCount = getDescendantBindings(node).length;
    const childContextItems = node.children.reduce((commonChildCIs, child, i) => {
        // If the binding count isn't equal, either a sibling or the parent had an extra binding,
        // So the children won't add any common CI that has full coverage anymore
        if (getDescendantBindings(child).length != bindingCount) return [];

        const childCIs = getCommonDescendantContextItems(child, targetAction);

        // Find the common CIs (for  when 2 siblings branch together again at a later point)
        if (i == 0) return childCIs;
        return getLCS(commonChildCIs, childCIs).map(([i]) => commonChildCIs[i]);
    }, [] as IOverrideContextItem[]);

    const allContextItems = [...contextItems, ...childContextItems];

    // Cache results for efficiency
    if (!node.descendantContextItems) node.descendantContextItems = new Map();
    node.descendantContextItems.set(targetAction, allContextItems);
    return allContextItems;
}
