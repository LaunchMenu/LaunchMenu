import {IActionTarget} from "../../../_types/IActionTarget";

/**
 * A callback for when items are executed
 */
export type IItemExecuteCallback = (items: IActionTarget[]) => void;
