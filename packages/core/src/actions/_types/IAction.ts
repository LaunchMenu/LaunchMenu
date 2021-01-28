import {IDataHook} from "model-react";
import {IActionBinding} from "./IActionBinding";
import {IActionResult} from "./IActionResult";
import {IActionTarget} from "./IActionTarget";

/**
 * An interface to represent common action data
 */
export type IAction<I = any, O = any, P extends IAction | void = any> = {
    /**
     * The name of this action, useful for debugging
     */
    readonly name: string;

    /**
     * The parents of this action, the actions that this action is a handler for
     */
    readonly parents: P[];

    /**
     * Applies this action transformer to the given bindings, used internally for the `get` method
     * @param bindingData The data of bindings to apply the transformer to
     * @param indices The indices of the passed data, which can be used to compute the indices for child bindings
     * @param hook A data hook to listen for changes
     * @param items The input items that actions can use to extract extra data
     * @returns The action result and any possible child bindings
     */
    transform(
        bindingData: I[],
        indices: number[],
        hook: IDataHook | undefined,
        items: IActionTarget[]
    ): IActionResult<P extends IAction ? IActionBinding<P> : void, O>;

    /**
     * Retrieves the action result for the given targets
     * @param targets The targets to get the result for
     * @param hook A data hook to listen for changes
     * @returns The action result
     */
    get(targets: IActionTarget[], hook?: IDataHook): O;
};
