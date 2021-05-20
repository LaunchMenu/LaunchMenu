import {IDataHook} from "model-react";
import {executeAction} from "../../actions/types/execute/executeAction";
import {hasActionBindingFor} from "../../actions/utils/hasActionBindingFor";
import {IMenuItem} from "./_types/IMenuItem";

/**
 * Checks whether a given item can be selected in the menu
 * @param item The item to check
 * @param hook The hook to subscribe to changes
 * @returns Whether the item is selectable
 * @exportTo ./menus/helpers
 */
export function isItemSelectable(item: IMenuItem, hook?: IDataHook): boolean {
    return hasActionBindingFor(executeAction, item, hook);
}
