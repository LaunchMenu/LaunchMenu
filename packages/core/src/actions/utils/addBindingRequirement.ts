import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {TIsBindingForAction} from "./_types/TIsBindingForAction";

/**
 * Adds a requirement to the `process` argument to only accept bindings that are directly or indirectly for the specified action
 * @param func The function to add the requirement to
 * @param action The action that the bindings should be for
 * @returns The same function with the additional input requirement
 */
export function addBindingRequirement<
    A extends IAction,
    I extends any[],
    O,
    BI = IActionBinding
>(
    func: (binding: BI, ...rest: I) => O,
    action: A
): {
    <B extends BI>(
        binding: B & (B extends IActionBinding ? TIsBindingForAction<B, A> : unknown),
        ...rest: I
    ): O;
} {
    return func as any;
}
