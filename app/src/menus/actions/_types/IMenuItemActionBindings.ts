import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionBinding} from "./IActionBinding";

/**
 * A combination of a menu item, and a subset of the action bindings to use for an action
 */
export type IMenuItemActionBindings = {
    /** The item that the bindings are from */
    item: IMenuItem;
    /** The action bindings to use */
    actionBindings: IActionBinding<any>[];
};
