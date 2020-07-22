import {ReactNode} from "react";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ICategory} from "../../actions/types/category/_types/ICategory";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = {
    /** The name of the menu item */
    name: string;

    /** The icon of the menu item */
    icon?: string | ReactNode;

    /** The description of the menu item */
    description?: string;

    /** Any tags that can be used for searching */
    tags?: string[];

    /** The function to execute when executing the menu item's default action */
    onExecute?: () => void; // TODO: also add command based signature once undo/redo is made

    /** A listener to execute side effects when the item is selected or deselected */
    onSelect?: (selected: boolean) => void;

    /** A listener to execute side effects when the item becomes the cursor */
    onCursor?: (isCursor: boolean) => void;

    /** The category to put the item under in the menu */
    category?: ICategory;

    /** Bindings to additional actions */
    actionBindings?: IActionBinding<any>[];
};
