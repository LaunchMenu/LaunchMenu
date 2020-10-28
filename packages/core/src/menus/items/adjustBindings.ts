import {IDataHook} from "model-react";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {ISubscribableActionBindings} from "./_types/ISubscribableActionBindings";

/**
 * Adapts the given bindings using the passed function
 * @param bindings The bindings to be augmented, either a plain array, of subscribable bindings
 * @param extendBindings The function to transform the action bindings
 * @returns The new subscribable action bindings
 * @exportTo ./menus/helpers
 */
export function adjustBindings(
    bindings: ISubscribableActionBindings,
    extendBindings: (
        bindings: IActionBinding<any>[],
        hooh: IDataHook
    ) => IActionBinding<any>[]
): ISubscribableActionBindings {
    return (hook: IDataHook) =>
        extendBindings(bindings instanceof Function ? bindings(hook) : bindings, hook);
}
