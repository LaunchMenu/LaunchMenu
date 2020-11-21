import {IActionTarget} from "../../../actions/_types/IActionTarget";
import {IMenuItemView} from "./IMenuItemView";

/**
 * An item to appear on a menu
 */
export type IMenuItem = {
    /**
     * The view of the menu item, in order to visualize the item in the menu
     */
    readonly view: IMenuItemView;
} & IActionTarget;
