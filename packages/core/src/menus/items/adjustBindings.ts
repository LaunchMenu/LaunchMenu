import {IDataHook} from "model-react";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";

/**
 * Adapts the given bindings using the passed function
 * @param bindings The bindings to be augmented, either a plain array, of subscribable bindings
 * @param extendBindings The function to transform the action bindings
 * @returns The new subscribable action bindings
 * @exportTo ./menus/helpers
 */
export function adjustBindings(
    bindings: ISubscribable<IActionBinding[]>,
    extendBindings:
        | ((bindings: IActionBinding[], hooh: IDataHook) => IActionBinding[])
        | IActionBinding[]
): ISubscribable<IActionBinding[]> {
    if (bindings instanceof Array) {
        if (extendBindings instanceof Array) return [...bindings, ...extendBindings];
        else return (hook: IDataHook) => extendBindings(bindings, hook);
    } else {
        if (extendBindings instanceof Function)
            return (hook: IDataHook) => extendBindings(bindings(hook), hook);
        else return (hook: IDataHook) => [...bindings(hook), ...extendBindings];
    }
}
