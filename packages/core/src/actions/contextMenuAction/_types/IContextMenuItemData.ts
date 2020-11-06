import {IPrioritizedMenuItem} from "../../../menus/menu/_types/IPrioritizedMenuItem";
import {executeAction} from "../../types/execute/executeAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {TPureAction} from "../../_types/TPureAction";

type IExecuteBinding = IActionBinding<TPureAction<typeof executeAction>>;

/**
 * The data used to create context menu items
 */
export type IContextMenuItemData = {
    /** The action that this context item is for, if any */
    action: IAction | null;
    /**
     * The parent for which to replace their context menu item with this item, in case this is the only handler for them.
     * Gets inferred as the first parent of the action if left out and an action is provided.
     */
    parent?: IAction | null;
    /** The execute binding which handlers of this action may use to perform this action */
    execute?: IExecuteBinding;
    /** The item to show in the context menu */
    item:
        | {
              /**
               * Retrieves the item to show in the menu for this action
               * @param executeBinding The bindings that may be specified by ancestor actions (obtained from specified parents)
               * @returns The menu item to show in the menu
               */
              (executeBindings?: IExecuteBinding): IPrioritizedMenuItem;
          }
        | IPrioritizedMenuItem;
    /** Whether to prevent adding the count category to the item, defaults to false */
    preventCountCategory?: boolean;
};
