import {IDataHook} from "model-react";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IActionBinding} from "../../actions/_types/IActionBinding";

/**
 * The action bindings that could possibly be subscribed to
 */
export type ISubscribableActionBindings = ISubscribable<IActionBinding<any>[]>;
