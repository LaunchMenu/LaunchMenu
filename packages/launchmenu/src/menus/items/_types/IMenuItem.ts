import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IMenuItemView} from "./IMenuItemView";
import {ISubscribableActionBindings} from "./ISubscribableActionBindings";

/**
 * An item to appear on a menu
 */
export type IMenuItem = {
    /**
     * The view of the menu item, in order to visualize the item in the menu
     */
    readonly view: IMenuItemView;
    /**
     * All action bindings for this item, in order to execute an action of the item
     */
    readonly actionBindings: ISubscribableActionBindings;
    /**
     * Additional item tags that may be used for item identification
     */
    readonly tags?: ISubscribable<any[]>;
};
