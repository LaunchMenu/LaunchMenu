import {IDataHook} from "model-react";
import {executeAction} from "../../types/execute/executeAction";
import {IExecutable} from "../../types/execute/_types/IExecutable";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionResult} from "../../_types/IActionResult";
import {TPureAction} from "../../_types/TPureAction";

export type IContextActionTransformer<I, O, AB extends IActionBinding> = {
    /**
     * Applies this action transformer to the given bindings, used internally for the `get` method
     * @param bindingData The data of bindings to apply the transformer to
     * @param indices The indices of the passed data, which can be used to compute the indices for child bindings
     * @param hook A data hook to listen for changes
     * @returns The action result and any possible child bindings
     */
    (bindingData: I[], indices: number[], hook: IDataHook): IActionResult<AB, O> & {
        execute?: IActionBinding<TPureAction<typeof executeAction>> | IExecutable;
    };
};
