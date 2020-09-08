import {INonFunction} from "../../../_types/INonFunction";
import {results} from "../Action";
import {IAction} from "./IAction";

/**
 * An acceptable parent action for an action handler with the given output type
 */
export type IActionParent<O extends INonFunction> = O extends {[results]: (infer U)[]}
    ? U extends INonFunction
        ? IAction<U, any>
        : never
    : IAction<O, any>;
