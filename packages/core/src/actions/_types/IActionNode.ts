import {IAction} from "./IAction";
import {IActionResult} from "./IActionResult";
import {IActionTarget} from "./IActionTarget";
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

/**
 * A node in the action dependency graph, containing targets
 */
export type IActionNodeWithTargets = IActionNode & {
    /** The targets that had a binding for this action */
    targets: IActionTarget[];
    /** The child actions that create input for this action */
    children: IActionNodeWithTargets[];
};
