import {executeAction} from "../../actions/types/execute/executeAction";
import {hasActionBindingFor} from "../../actions/utils/hasActionBindingFor";
import {IMenuItem} from "./_types/IMenuItem";

/**
 * Checks whether a given item can be selected in the menu
 * @param item The item to check
 * @returns Whether the item is selectable
 * @exportTo ./menus/helpers
 */
export function isItemSelectable(item: IMenuItem): boolean {
    return hasActionBindingFor(executeAction, item);
}
