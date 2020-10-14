import {IMenuItem} from "./IMenuItem";
import {IMenu} from "../../menu/_types/IMenu";
import {IQuery} from "../../menu/_types/IQuery";
import {LFC} from "../../../_types/LFC";
import {IMenuItemExecuteCallback} from "../../menu/_types/IMenuItemExecuteCallback";

/**
 * The visualization of an item on the menu
 */
export type IMenuItemView = LFC<{
    /** Whether this item is currently selected as the cursor in the menu */
    isCursor: boolean;
    /** Whether this item is currently selected in the menu in order to execute actions on */
    isSelected: boolean;
    /**  A reference back to the item this component is a view for */
    item: IMenuItem;
    /** Highlighting data, things to be highlighted in the item */
    highlight: IQuery | null;
    /** The menu this item view is rendered for */
    menu: IMenu;
    /** A callback for when this item is executed (by mouse) */
    onExecute?: IMenuItemExecuteCallback;
}>;
