import {IDataHook} from "model-react";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IActionNode} from "../_types/IActionNode";
import {IActionResult} from "../_types/IActionResult";
import {IActionTarget} from "../_types/IActionTarget";
import {IIndexedActionBinding} from "../_types/IIndexedActionBinding";

/**
 * Obtains the result of the last action node, when all actions are reduced from left to right
 * @param actions The actions and their bindings to reduce to a single result
 * @param items The input items that actions can use to extract extra data
 * @param hook The hook to subscribe to changes (when action bindings change their data)
 * @param getActionResultIndex The function to use to decide how to order action handler bindings with other bindings
 * @returns The result of the final action
 */
export function reduceActions(
    actions: IActionNode[],
    items: IActionTarget[],
    hook?: IDataHook,
    getActionResultIndex: (bindings: IIndexedActionBinding[]) => number = bindings =>
        bindings[0] ? bindings[0].index : Infinity
): IActionResult<any, any> | undefined {
    for (let i = 0; i < actions.length; i++) {
        const node = actions[i];

        // Get all input data for the action and obtain the result
        const bindings = getAllActionBindings(node);
        if (bindings.length == 0 && i != actions.length - 1) continue; // Can happen if a handler decides to not create any bindings, but we always want to compute the final action
        const inputs = bindings.map(binding => getBindingData(binding, hook));
        const indices = bindings.map(binding => binding.index);
        const result = node.action.transform(
            inputs,
            indices,
            hook,
            items
        ) as IActionResult<IActionBinding, any>;

        // Add index data to the result's bindings
        const combinedIndex = getActionResultIndex(bindings);
        const indexedResult = getIndexedResult(result, indices, combinedIndex);

        // Store the result of the action in the node
        node.result = indexedResult;
    }

    return actions[actions.length - 1]?.result;
}

/**
 * Retrieves the action bindings given action, combining direct bindings and handler result bindings in the correct order
 * @param actionNode The node to get the action inputs for
 * @returns The inputs for the action of the given node
 */
export function getAllActionBindings(actionNode: IActionNode): IIndexedActionBinding[] {
    const bindings = [...actionNode.bindings];
    const {action} = actionNode;

    // Go through all handlers, and for each handler add the resulting binding in the correct index, if for this action
    actionNode.children.forEach(child => {
        child.result?.children?.forEach(parentBinding => {
            if (parentBinding.action == action) {
                // Insert the binding at the proper index
                outer: {
                    for (let i = 0; i < bindings.length; i++) {
                        if (bindings[i].index > parentBinding.index) {
                            bindings.splice(i, 0, parentBinding);
                            break outer;
                        }
                    }
                    bindings.push(parentBinding);
                }
            }
        });
    });

    // Return the resulting bindings
    return bindings;
}

/**
 * Retrieves the binding data for a given action binding
 * @param binding The binding to retrieve the data of
 * @param hook The data hook to subscribe to changes
 * @returns The binding data
 */
export function getBindingData<A extends IAction<I, any, any>, I>(
    binding: IActionBinding<A>,
    hook?: IDataHook
): I {
    if ("data" in binding) return binding.data;
    else return binding.subscribableData(hook);
}

/**
 * Adds appropriate indexing data to all child bindings of this result
 * @param actionResult The action result to add indexing to
 * @param indices The indices of the inputs of this action
 * @param combinedIndices The combined indices of the input
 * @returns The indexed result
 */
export function getIndexedResult<B extends IAction, O>(
    actionResult: IActionResult<IActionBinding<B>, O>,
    indices: number[],
    combinedIndices: number
): IActionResult<IIndexedActionBinding<B>, O> {
    // Get the indices object that checks what index we are at, and whether the binding count corresponds to the index count
    const actionIndices: {action: IAction; count: number; index: number}[] = [];
    actionResult.children?.forEach(binding => {
        const f = actionIndices.find(({action}) => binding.action == action);
        if (f) f.count++;
        else actionIndices.push({action: binding.action, count: 1, index: 0});
    });

    // Map the indices
    return {
        ...actionResult,
        children: actionResult.children?.map(
            (binding: IIndexedActionBinding<B> | IActionBinding<B>) => {
                if ("index" in binding && binding.index != undefined) return binding;

                // Default to the combined index
                let index = combinedIndices;

                // If the number of bindings for this action corresponds to the number of inputs, map it to the input indices
                const f = actionIndices.find(({action}) => binding.action == action);
                if (f?.count == indices.length) index = indices[f.index++];

                // Return the binding with the index
                return {...binding, index};
            }
        ),
    };
}
