import {IDataHook} from "model-react";
import {IActionBinding} from "../../actions/_types/IActionBinding";

/**
 * The action bindings that could possibly be subscribed to
 */
export type ISubscribableActionBindings =
    | IActionBinding<any>[]
    | ((hook?: IDataHook) => IActionBinding<any>[]);
