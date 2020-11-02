import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {IAction} from "./IAction";
import {IActionBinding} from "./IActionBinding";
/**
 * The type of target that an action can be applied to
 */
export type IActionTarget = {actionBindings: ISubscribable<IActionBinding<IAction>[]>};
