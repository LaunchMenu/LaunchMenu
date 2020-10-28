import {IDataHook} from "model-react";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {INonFunction} from "../../../_types/INonFunction";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IAction} from "../_types/IAction";
import {IMenuItemActionBindings} from "../_types/IMenuItemActionBindings";

/**
 * Retrieves the direct bindings to the given action, ignoring any handlers of the action
 * @param action The action for which to retrieve bindings
 * @param items The items to look for both direct and indirect bindings for
 * @param hook The hook to subscribe to changes
 * @returns The found data
 */
export function extractDirectActionBindingData<I extends INonFunction>(
    action: IAction<I, any>,
    items: (IMenuItem | IMenuItemActionBindings)[],
    hook?: IDataHook
): {data: I; source: IMenuItem | IMenuItemActionBindings}[] {
    return items.flatMap(item =>
        getHooked(item.actionBindings, hook).flatMap(binding => {
            if (binding.action == action) return {data: binding.data, source: item};
            return [];
        })
    );
}
