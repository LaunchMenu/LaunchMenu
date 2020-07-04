import {FC} from "react";
import {IMenuItem} from "./IMenuItem";
import {IMenu} from "../../menu/_types/IMenu";

/**
 * The visualization of an item on the menu
 */
export type IMenuItemView = FC<{
    /**
     * Whether this item is currently selected as the cursor in the menu
     */
    isCursor: boolean;
    /**
     * Whether this item is currently selected in the menu in order to execute actions on
     */
    isSelected: boolean;
    /**
     * A reference back to the item this component is a view for
     */
    item: IMenuItem;
    /**
     * The menu this item view is rendered for
     */
    menu: IMenu;
    /**
     * Views won't have any children
     */
    children?: never;
}>;
