import {FC} from "react";
import {IMenuItem} from "./IMenuItem";

/**
 * The visualization of an item on the menu
 */
export type IMenuItemView = FC<{
    /**
     * Whether this item is currently selected as the cursor in the menu
     */
    readonly isCursor: boolean;
    /**
     * Whether this item is currently selected in the menu in order to execute actions on
     */
    readonly isSelected: boolean;
    /**
     * A reference back to the item this component is a view for
     */
    readonly item: IMenuItem;
    // readonly menu: IMenu; // TODO: uncomment once we got menus
}>;
