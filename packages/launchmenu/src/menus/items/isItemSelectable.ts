import {IMenuItem} from "./_types/IMenuItem";
import {executeAction} from "../actions/types/execute/executeAction";

/**
 * Checks whether a given item can be selected in the menu
 * @param item The item to check
 * @returns Whether the item is selectable
 */
export function isItemSelectable(item: IMenuItem): boolean {
    return executeAction.canBeAppliedTo(item);
}
