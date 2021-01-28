import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";

/**
 * Checks whether a binding is (directly or indirectly) for a given action
 * @param action The action to find bindings for
 * @param binding The binding to check
 * @returns Whether a binding was found
 */
export function isActionBindingFor(
    action: IAction,
    binding: IActionBinding[] | IActionBinding
): boolean {
    if (!(binding instanceof Array)) binding = [binding];

    // Collect all actions
    const actions = new Set<IAction>();
    binding.forEach(({action}) => {
        actions.add(action);
    });

    // Find all ancestors
    for (let action of actions) action.parents.forEach(parent => actions.add(parent));

    // Check whether the action is present in the set
    return actions.has(action);
}
