import {IDataHook} from "model-react";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IAction} from "../_types/IAction";
import {IActionNode, IActionNodeWithTargets} from "../_types/IActionNode";
import {IActionTarget} from "../_types/IActionTarget";
import {IIndexedActionBinding} from "../_types/IIndexedActionBinding";

/**
 * Creates a new action graph
 * @param targets The targets to retrieve all bindings and actions from
 * @param hook The data hook to subscribe to changes
 * @param collectTargets Whether to also collect the target per node
 * @returns The action graph
 */
export function createActionGraph<T extends boolean = false>(
    targets: IActionTarget[],
    hook: IDataHook = null,
    collectTargets?: T
): (T extends true ? IActionNodeWithTargets : IActionNode)[] {
    // Retrieve all actions and their bindings
    const actionBindings: {
        action: IAction;
        bindings: IIndexedActionBinding[];
        targets: IActionTarget[];
    }[] = [];
    let index = 0;
    targets.forEach(target => {
        const bindings = getHooked(target.actionBindings, hook);
        bindings.forEach(binding => {
            const action = actionBindings.find(({action}) => action == binding.action);

            // Do some extra work when the target data is also requested
            if (collectTargets) {
                if (action) {
                    action.bindings.push({...binding, index});
                    if (!action.targets.includes(target)) action.targets.push(target);
                } else
                    actionBindings.push({
                        action: binding.action,
                        bindings: [{...binding, index}],
                        targets: [target],
                    });
            } else {
                // Ignore the targets if not requested for slightly better performance
                if (action) action.bindings.push({...binding, index});
                else
                    actionBindings.push({
                        action: binding.action,
                        bindings: [{...binding, index}],
                        targets: [],
                    });
            }

            index++;
        });
    });

    // Create nodes for the actions
    const nodes = actionBindings.map(actionBindings => ({
        ...actionBindings,
        children: [] as IActionNode[],
    })) as IActionNodeWithTargets[];

    // Add all children to the nodes
    for (let i = 0; i < nodes.length; i++) {
        const actionNode = nodes[i];
        actionNode.action.parents.forEach(p => {
            const parentNode = nodes.find(({action}) => action == p);
            if (parentNode) parentNode.children.push(actionNode);
            else
                nodes.push({
                    action: p,
                    bindings: [],
                    targets: [],
                    children: [actionNode],
                });
        });
    }

    return nodes as (T extends true ? IActionNodeWithTargets : IActionNode)[];
}

/**
 * Creates a new action handler tree for the given action. Note, it's not actually a fully proper tree, the same node may appear in the tree multiple times, so it's more like a DAG with a single source.
 * @param rootAction The action to create the handler graph for
 * @param targets The targets to retrieve all bindings and handlers from
 * @param hook The data hook to subscribe to changes
 * @param collectTargets Whether to also collect the target per node
 * @returns The action handler tree
 */
export function createActionHandlerTree<T extends boolean = false>(
    rootAction: IAction,
    targets: IActionTarget[],
    hook: IDataHook = null,
    collectTargets?: T
): T extends true ? IActionNodeWithTargets : IActionNode {
    const nodes = createActionGraph<T>(targets, hook, collectTargets);

    // Return the root node, with a fallback in case no targets have a binding for this action
    const fallback = ({
        action: rootAction,
        children: [],
        bindings: [],
        targets: [],
    } as unknown) as T extends true ? IActionNodeWithTargets : IActionNode;
    return nodes.find(({action}) => action == rootAction) || fallback;
}
