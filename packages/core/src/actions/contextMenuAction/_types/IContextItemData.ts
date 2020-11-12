import {ReactNode} from "react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {IPriority} from "../../../menus/menu/priority/_types/IPriority";
import {IActionBinding} from "../../_types/IActionBinding";

/**
 * The configuration for context menu actions items
 */
export type IContextItemData = {
    /** Whether to close the menu when the action is executed, defaults to true */
    closeOnExecute?: boolean;

    /** The keyboard shortcut for the action */
    shortcut?: KeyPattern | ((context: IIOContext) => KeyPattern);

    /** The extra action bindings for the item  */
    actionBindings?: IActionBinding<any>[];

    /** The name of the menu item, defaults to the action name */
    name?: string;

    /** The icon of the menu item */
    icon?: string | ReactNode;

    /** The description of the menu item */
    description?: string;

    /** Any tags that can be used for searching */
    tags?: string[];

    /** The priority with which this action should appear in the context menu */
    priority?: IPriority;
};
