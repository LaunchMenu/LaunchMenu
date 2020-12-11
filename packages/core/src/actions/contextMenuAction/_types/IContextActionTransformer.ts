import {IDataHook} from "model-react";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IExecutable} from "../../types/execute/_types/IExecutable";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionResult} from "../../_types/IActionResult";

export type IContextActionTransformer<I, O, AB extends IActionBinding> = {
    /**
     * Applies this action transformer to the given bindings, used internally for the `get` method
     * @param bindingData The data of bindings to apply the transformer to
     * @param indices The indices of the passed data, which can be used to compute the indices for child bindings
     * @param hook A data hook to listen for changes
     * @returns The action result and any possible child bindings
     */
    (bindingData: I[], indices: number[], hook: IDataHook): IActionResult<AB, O> & {
        /** A default execute function for the context menu item */
        execute?: IExecutable;
        /** Action bindings to be used by the context menu item */
        actionBindings?: ISubscribable<IActionBinding[]>;
    };
};
