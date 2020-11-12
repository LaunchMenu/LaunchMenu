import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";

/**
 * The action bindings that could possibly be subscribed to
 */
export type ISubscribableActionBindings = ISubscribable<IActionBinding[]>;
