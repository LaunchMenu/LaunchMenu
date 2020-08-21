import {results} from "../Action";
import {IAction} from "./IAction";

/**
 * An acceptable parent action for an action handler with the given output type
 */
export type IActionParent<O> = O extends {[results]: (infer U)[]}
    ? IAction<U, any>
    : IAction<O, any>;
