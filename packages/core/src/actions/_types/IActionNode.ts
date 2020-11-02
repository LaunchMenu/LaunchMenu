import {IAction} from "./IAction";
import {IActionResult} from "./IActionResult";
import {IIndexedActionBinding} from "./IIndexedActionBinding";

/**
 * A node in the action dependency graph
 */
export type IActionNode = {
    /** The action that this node is for */
    action: IAction;
    /** The child actions that create input for this action */
    children: IActionNode[];
    /** The direct bindings for this action, in sorted order */
    bindings: IIndexedActionBinding[];
    /** The result of applying the action */
    result?: IActionResult<IIndexedActionBinding, any>;
};
