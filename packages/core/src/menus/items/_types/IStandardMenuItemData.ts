import {ReactNode} from "react";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenu} from "../../menu/_types/IMenu";
import {IExecutable} from "../../actions/types/execute/_types/IExecutable";
import {IDataHook} from "model-react";
import {ISubscribableActionBindings} from "./ISubscribableActionBindings";
import {ISimpleSearchPatternMatcher} from "../../actions/types/search/simpleSearch/_types/ISimpleSearchData";
import {IMenuItemContent} from "../../actions/types/onCursor/_types/IMenuItemContent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = {
    /** The name of the menu item */
    name: string | ((h?: IDataHook) => string);

    /** The icon of the menu item */
    icon?: string | ReactNode | ((h?: IDataHook) => string | ReactNode | undefined);

    /** The description of the menu item */
    description?: string | ((h?: IDataHook) => string | undefined);

    /** Any tags that can be used for searching */
    tags?: string[] | ((h?: IDataHook) => string[]);

    /** A shortcut that will activate this menu item */
    shortcut?: KeyPattern | ((context: IIOContext) => KeyPattern);

    /** Content to show when this item is selected */
    content?: IMenuItemContent;

    /** The category to put the item under in the menu */
    category?: ICategory;

    /** Bindings to additional actions */
    actionBindings?: ISubscribableActionBindings;

    /** A pattern matcher that can be used to capture patterns in a search and highlight them */
    searchPattern?: ISimpleSearchPatternMatcher;

    // Event listeners
    /** The function to execute when executing the menu item's default action */
    onExecute?: IExecutable["execute"];

    /** Whether to not invoke the menus execution callback if only onExecute gets executed (defaults to false) */
    executePassively?: boolean;

    /** A listener to execute side effects when the item is selected or deselected */
    onSelect?: (selected: boolean) => void;

    /** A listener to execute side effects when the item becomes the cursor */
    onCursor?: (isCursor: boolean) => void;

    /** A listener to track what menus an item is added to */
    onMenuChange?: (menu: IMenu, added: boolean) => void;
};
