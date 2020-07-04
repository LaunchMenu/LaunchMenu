import {IActionHandler} from "./IActionHandler";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * The combination of action handlers and the items that have bindings for them
 */
export type IActionHandlerItems<O, I = any> = {
    /**
     * The action handler
     */
    readonly handler: IActionHandler<I, O, any>;

    /**
     * The binding data of the items
     */
    readonly data: I[];

    /**
     * The items having bindings for this handler
     */
    readonly items: IMenuItem[];
}[];
