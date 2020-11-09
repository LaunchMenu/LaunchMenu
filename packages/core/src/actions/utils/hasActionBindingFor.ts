import {IDataHook} from "model-react";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IAction} from "../_types/IAction";
import {IActionTarget} from "../_types/IActionTarget";

/**
 * Checks whether an action target has bindings (directly or indirectly) for a given action
 * @param action The action to find bindings for
 * @param targets The target to find the bindings on
 * @param hook The data hook to subscribe to changes
 * @returns Whether a binding was found
 */
export function hasActionBindingFor(
    action: IAction,
    targets: IActionTarget[] | IActionTarget,
    hook: IDataHook = null
): boolean {
    if (!(targets instanceof Array)) targets = [targets];

    // Collect all actions
    const actions = new Set<IAction>();
    targets.forEach(target => {
        getHooked(target.actionBindings, hook).forEach(({action}) => {
            actions.add(action);
        });
    });

    // Find all ancestors
    for (let action of actions) action.parents.forEach(parent => actions.add(parent));

    // Check whether the action
    return actions.has(action);
}
