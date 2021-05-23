import {IDataHook} from "model-react";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IExecutable} from "../../types/execute/_types/IExecutable";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionResult} from "../../_types/IActionResult";
import {IActionTarget} from "../../_types/IActionTarget";

export type IContextActionTransformer<I, O, AB extends IActionBinding | void> = {
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
    ): IActionResult<AB, O> & {
        /** A default execute function for the context menu item */
        execute?: IExecutable;
        /** Action bindings to be used by the context menu item */
        actionBindings?: ISubscribable<IActionBinding[]>;
    };
};
