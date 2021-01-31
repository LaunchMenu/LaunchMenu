import {IActionBinding} from "./IActionBinding";

/**
 * The standard result that an action can output
 */
export type IActionResult<AB extends IActionBinding | void, O> = {
    /** bindings for parent actions */
    children?: AB[];
    /** The direct result of applying this action */
    result?: O;
};
