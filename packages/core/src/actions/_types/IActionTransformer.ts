import {IDataHook} from "model-react";
import {IActionBinding} from "./IActionBinding";
import {IActionResult} from "./IActionResult";
import {IActionTarget} from "./IActionTarget";

export type IActionTransformer<I, O, AB extends IActionBinding | void> = {
    /**
     * Applies this action transformer to the given bindings, used internally for the `get` method
     * @param bindingData The data of bindings to apply the transformer to
     * @param indices The indices of the passed data, which can be used to compute the indices for child bindings
     * @param hook A data hook to listen for changes
     * @param items The input items that actions can use to extract extra data
     * @returns The action result and any possible child bindings
     */
    (
        bindingData: I[],
        indices: number[],
        hook: IDataHook,
        items: IActionTarget[]
    ): IActionResult<AB, O>;
};
