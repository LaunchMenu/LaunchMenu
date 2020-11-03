import {IDataHook} from "model-react";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IAction} from "../_types/IAction";
import {IActionNode} from "../_types/IActionNode";
import {IActionTarget} from "../_types/IActionTarget";
import {IIndexedActionBinding} from "../_types/IIndexedActionBinding";

/**
 * Creates a new action graph
 * @param targets The targets to retrieve all bindings and actions from
 * @param hook The data hook to subscribe to changes
 * @returns The action graph
 */
export function createActionGraph(
    targets: IActionTarget[],
    hook: IDataHook = null
): IActionNode[] {
    // Retrieve all bindings of the given targets
    const bindings = targets.flatMap(target => getHooked(target.actionBindings, hook));

    // Retrieve all actions and their bindings
    const actionBindings: {action: IAction; bindings: IIndexedActionBinding[]}[] = [];
    bindings.forEach((binding, i) => {
        const action = actionBindings.find(({action}) => action == binding.action);
        if (action) action.bindings.push({...binding, index: i});
        else
            actionBindings.push({
                action: binding.action,
                bindings: [{...binding, index: i}],
            });
    });

    // Create nodes for the actions
    const nodes = actionBindings.map(actionBindings => ({
        ...actionBindings,
        children: [] as IActionNode[],
    })) as IActionNode[];

    // Add all children to the nodes
    for (let i = 0; i < nodes.length; i++) {
        const actionNode = nodes[i];
        actionNode.action.parents.forEach(p => {
            const parentNode = nodes.find(({action}) => action == p);
            if (parentNode) parentNode.children.push(actionNode);
            else nodes.push({action: p, bindings: [], children: [actionNode]});
        });
    }

    return nodes;
}

/**
 * Creates a new action handler tree for the given action. Note, it's not actually a fully proper tree, the same node may appear in the tree multiple times, so it's more like a DAG with a single source.
 * @param rootAction The action to create the handler graph for
 * @param targets The targets to retrieve all bindings and handlers from
 * @param hook The data hook to subscribe to changes
 * @returns The action handler tree
 */
export function createActionHandlerTree(
    rootAction: IAction,
    targets: IActionTarget[],
    hook: IDataHook = null
): IActionNode {
    const nodes = createActionGraph(targets, hook);

    // Return the root node, with a fallback in case no targets have a binding for this action
    const fallback = {
        action: rootAction,
        children: [],
        bindings: [],
    };
    return nodes.find(({action}) => action == rootAction) || fallback;
}
