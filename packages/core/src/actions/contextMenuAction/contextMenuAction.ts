import {IDataHook} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {getContextCategory} from "../../menus/categories/createContextCategory";
import {adjustBindings} from "../../menus/items/adjustBindings";
import type {ProxiedPrioritizedMenu} from "../../menus/menu/ProxiedPrioritizedMenu";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createAction} from "../createAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IActionTarget} from "../_types/IActionTarget";
import {IContextMenuItemData} from "./_types/IContextMenuItemData";
import {createActionGraph} from "../actionGraph/createActionHandlerTree";
import {IActionNodeWithTargets} from "../_types/IActionNode";
import {IIndexedActionBinding} from "../_types/IIndexedActionBinding";
import {getLCS} from "../../utils/getLCS";
import {getCategoryAction} from "../types/category/getCategoryAction";

type IContextItemNode = Omit<IActionNodeWithTargets, "children"> & {
    contextItems: IContextMenuItemData[];
    children: IContextItemNode[];
    descendantBindings?: IIndexedActionBinding[];
    descendantTargets?: IActionTarget[];
    descendantContextItems?: WeakMap<IAction, IOverrideContextItem[]>;
};

type IOverrideContextItem = {
    node: IContextItemNode;
    contextItem: IContextMenuItemData;
};

export const contextMenuAction = createAction({
    name: "contextMenuAction",
    core: (items: IContextMenuItemData[]) => ({result: items}),

    extra: {
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
            const contextItemData = contextMenuAction.get(allTargets, hook);

            // Retrieve the action graph of all bindings, and attach the context items for each action
            const actionGraph = createActionGraph(allTargets, hook, true);
            const nodesWithContextItems = actionGraph.map((node: IContextItemNode) => {
                node.contextItems = contextItemData.filter(
                    ({action}) => action == node.action
                );
                return node;
            });

            // const rootNodes = nodesWithContextItems.filter(node=>!node.contextItems.find());
            const actionContextItems = nodesWithContextItems.flatMap(node =>
                node.contextItems.flatMap(rootCIData => {
                    if (rootCIData.override) return []; // Is not a root item

                    // Find the most specialized CI item for this subDAG
                    const commonContextItems = getCommonDescendantContextItems(
                        node,
                        node.action
                    );
                    const mostSpecializedItem =
                        commonContextItems[commonContextItems.length - 1];

                    const {contextItem: CI, node: CINode} = mostSpecializedItem;

                    // Return the menu item, potentially with category
                    const contextItem =
                        CI.item instanceof Function
                            ? CI.item(rootCIData.execute)
                            : CI.item;

                    const targetCount = getDescendantTargets(CINode).length;
                    const skipCategory =
                        CI.preventCountCategory || targetCount == totalItemCount;
                    return skipCategory
                        ? contextItem
                        : getItemWithCountCategory(
                              contextItem,
                              targetCount,
                              totalItemCount
                          );
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

            // Dynamically import the proxied prioritized menu class in order to deal with circular dependencies
            const ProxiedPrioritizedMenuClass: typeof ProxiedPrioritizedMenu = require("../../menus/menu/ProxiedPrioritizedMenu")
                .ProxiedPrioritizedMenu;
            return new ProxiedPrioritizedMenuClass(context, contextItems);
        },
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

/**
 * Retrieves all descendant (self + recursive children) bindings for a given node, and caches them within the node
 * @param node The node to retrieve the descendant bindings for
 * @returns All the descendant bindings
 */
function getDescendantBindings(node: IContextItemNode): IIndexedActionBinding[] {
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
function getDescendantTargets(node: IContextItemNode): IActionTarget[] {
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
function getCommonDescendantContextItems(
    node: IContextItemNode,
    targetAction: IAction
): IOverrideContextItem[] {
    if (node.descendantContextItems?.has(targetAction))
        return node.descendantContextItems.get(targetAction) as IOverrideContextItem[];

    const contextItems = node.contextItems
        .filter(CI => CI.action == targetAction || CI.override == targetAction)
        .map(CI => ({contextItem: CI, node}));

    const bindingCount = getDescendantBindings(node).length;
    const childContextItems = node.children.reduce((commonChildCIs, child, i) => {
        // If the binding count isn't equal, either a sibling or the parent had an extra binding,
        // So the children won't add any common CI that has full coverage anymore
        if (getDescendantBindings(child).length != bindingCount) return [];

        const childCIs = getCommonDescendantContextItems(child, targetAction);

        // Find the common CIs
        if (i == 0) return childCIs;
        return getLCS(commonChildCIs, childCIs).map(([i]) => commonChildCIs[i]);
    }, []);

    const allContextItems = [...contextItems, ...childContextItems];

    // Cache results for efficiency
    if (!node.descendantContextItems) node.descendantContextItems = new WeakMap();
    node.descendantContextItems.set(targetAction, allContextItems);
    return allContextItems;
}
