import {IDataHook} from "model-react";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IExecutableFunction} from "../../../actions/types/execute/_types/IExecutable";
import {IMenuItemContent} from "../../../actions/types/onCursor/_types/IMenuItemContent";
import {ISimpleSearchPatternMatcher} from "../../../actions/types/search/simpleSearch/_types/ISimpleSearchData";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IMenu} from "../../menu/_types/IMenu";
import {IMenuItem} from "./IMenuItem";
import {IShortcutInput} from "./IShortcutInput";

/**
 * The standard data that action bindings can be created for/with
 */
export type IStandardActionBindingData = {
    /** The name of the menu item */
    name: string | ((h?: IDataHook) => string);

    /** The description of the menu item */
    description?: string | ((h?: IDataHook) => string | undefined);

    /** Any tags that can be used for searching */
    tags?: string[] | ((h?: IDataHook) => string[]);

    /** A shortcut that will activate this menu item */
    shortcut?: IShortcutInput;

    /** Content to show when this item is selected */
    content?: IMenuItemContent;

    /** The category to put the item under in the menu */
    category?: ICategory;

    /** Bindings to additional actions */
    actionBindings?: ISubscribable<IActionBinding[]>;

    /** A pattern matcher that can be used to capture patterns in a search and highlight them */
    searchPattern?: ISimpleSearchPatternMatcher;

    // Event listeners
    /** The function to execute when executing the menu item's default action */
    onExecute?: IExecutableFunction;

    /** Whether to not invoke the menus execution callback if only onExecute gets executed (defaults to false) */
    executePassively?: boolean;

    /** A listener to execute side effects when the item is selected or deselected */
    onSelect?: (selected: boolean) => void;

    /** A listener to execute side effects when the item becomes the cursor */
    onCursor?: (isCursor: boolean) => void;

    /** A listener to track what menus an item is added to */
    onMenuChange?: (menu: IMenu, added: boolean) => void;

    /** The children that should be included in searches, defaults to undefined*/
    searchChildren?: ISubscribable<IMenuItem[]>;
};
