import {IActionBinding} from "./IActionBinding";

export type IActionResult<AB extends IActionBinding, O> = {
    /** bindings for parent actions */
    children?: AB[];
    /** The direct result of applying this action */
    result?: O;
};
