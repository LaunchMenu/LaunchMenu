import {IPrioritizedMenuItem} from "../../../menus/menu/_types/IPrioritizedMenuItem";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";

/**
 * The data used to create context menu items
 */
export type IContextMenuItemData = {
    /** The action that this context item is for, if any */
    action: IAction | null;
    /**
     * The root action for which to override the context item, if all its bindings originate from this action.
     * Will automatically override any ancestor overrides too (overrides specified by our ancestors).
     */
    override?: IAction;
    /** The execute binding which override of this item may use to perform this action */
    execute?: ISubscribable<IActionBinding[]>;
    /** The item to show in the context menu */
    item:
        | {
              /**
               * Retrieves the item to show in the menu for this action
               * @param executeBinding The bindings that may be specified by ancestor actions (obtained from specified parents)
               * @returns The menu item to show in the menu
               */
              (executeBindings?: ISubscribable<IActionBinding[]>): IPrioritizedMenuItem;
          }
        | IPrioritizedMenuItem;
    /** Whether to prevent adding the count category to the item, defaults to false */
    preventCountCategory?: boolean;
};
