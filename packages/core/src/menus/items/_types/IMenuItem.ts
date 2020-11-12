import {IActionTarget} from "../../../actions/_types/IActionTarget";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IMenuItemView} from "./IMenuItemView";

/**
 * An item to appear on a menu
 */
export type IMenuItem = {
    /**
     * The view of the menu item, in order to visualize the item in the menu
     */
    readonly view: IMenuItemView;
    /**
     * Additional item tags that may be used for item identification
     */
    readonly tags?: ISubscribable<any[]>;
} & IActionTarget;
