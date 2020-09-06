import {IDataHook} from "model-react";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {ISubscribableActionBindings} from "./_types/ISubscribableActionBindings";

/**
 * Retrieves the action bindings list from the given subscribable action bindings
 * @param bindings The bindings to retrieve
 * @param hook The data hook to subscribe to changes
 * @returns The action bindings list
 */
export function getBindings(
    bindings: ISubscribableActionBindings,
    hook?: IDataHook
): IActionBinding<any>[] {
    return bindings instanceof Function ? bindings(hook) : bindings;
}
