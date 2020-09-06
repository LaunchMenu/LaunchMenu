import {ReactNode} from "react";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenu} from "../../menu/_types/IMenu";
import {IExecutable} from "../../actions/types/execute/_types/IExecutable";
import {IDataHook} from "model-react";
import {ISubscribableActionBindings} from "./ISubscribableActionBindings";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = {
    /** The name of the menu item */
    name: string | ((h?: IDataHook) => string);

    /** The icon of the menu item */
    icon?: string | ReactNode | ((h?: IDataHook) => string | ReactNode);

    /** The description of the menu item */
    description?: string | ((h?: IDataHook) => string);

    /** Any tags that can be used for searching */
    tags?: string[] | ((h?: IDataHook) => string[]);

    /** The function to execute when executing the menu item's default action */
    onExecute?: IExecutable["execute"];

    /** A listener to execute side effects when the item is selected or deselected */
    onSelect?: (selected: boolean) => void;

    /** A listener to execute side effects when the item becomes the cursor */
    onCursor?: (isCursor: boolean) => void;

    /** A listener to track what menus an item is added to */
    onMenuChange?: (menu: IMenu, added: boolean) => void;

    /** The category to put the item under in the menu */
    category?: ICategory;

    /** Bindings to additional actions */
    actionBindings?: ISubscribableActionBindings;
};
