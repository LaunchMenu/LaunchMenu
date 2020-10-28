import {IDataHook} from "model-react";
import {INonFunction} from "../../../_types/INonFunction";
import {IAction} from "./IAction";

/**
 * A binding to an action action, specifying the data to execute the handler on an item, functions are not allowed
 */
export type IActionBinding<I extends INonFunction> = {
    /**
     * The action to bind
     */
    readonly action: IAction<I, any>;
    /**
     * The binding data to be used by the action handler
     */
    readonly data: I | ((hook?: IDataHook) => I);
    /**
     * The tags for this binding, can be used to add extra meta data
     */
    readonly tags: unknown[];
};
