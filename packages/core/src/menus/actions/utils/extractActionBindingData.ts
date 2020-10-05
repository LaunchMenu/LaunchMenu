import {IDataHook} from "model-react";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {INonFunction} from "../../../_types/INonFunction";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {results} from "../Action";
import {IAction} from "../_types/IAction";
import {IActionMultiResult} from "../_types/IActionMultiResult";
import {IMenuItemActionBindings} from "../_types/IMenuItemActionBindings";

function containsResults<I>(
    handler: I | IActionMultiResult<I>
): handler is IActionMultiResult<I> {
    return results in handler;
}

/**
 * Retrieves the direct bindings to the given action, including handler by calling them when needed
 * @param action The action for which to retrieve bindings
 * @param items The items to look for both direct and indirect bindings for
 * @param hook The hook to subscribe to changes
 * @returns The found data
 */
export function extractActionBindingData<I extends INonFunction>(
    action: IAction<I, any>,
    items: (IMenuItem | IMenuItemActionBindings)[],
    hook?: IDataHook
): {data: I; source: IMenuItem | IMenuItemActionBindings}[] {
    const index = action.ancestors.length;
    return items.flatMap(source => {
        return getHooked(source.actionBindings, hook).flatMap(binding => {
            const isKeyHandlerBinding = action.canBeAppliedTo([binding]);
            if (isKeyHandlerBinding) {
                const isDirectBinding = binding.action == action;
                // Extract the direct data if it's a direct binding of the action
                if (isDirectBinding)
                    return {data: getHooked(binding.data as I, hook), source};
                else {
                    // Invoke the getter of the action if it's a handler for the action
                    const handler = (binding.action.ancestors[index + 1] ||
                        binding.action) as IAction<any, I>;
                    const data = handler.get(
                        [
                            {
                                item: "item" in source ? source.item : source,
                                actionBindings: [binding],
                            },
                        ],
                        hook
                    );
                    if (containsResults(data))
                        return data[results].map(data => ({data, source}));
                    else return {data, source};
                }
            }
            return [];
        });
    });
}
