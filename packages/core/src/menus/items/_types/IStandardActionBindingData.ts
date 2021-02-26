import {IDataHook} from "model-react";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IShowChildInParent} from "../../../actions/types/search/tracedRecursiveSearch/_types/IShowChildInParent";
import {ISimpleSearchPatternMatcher} from "../../../actions/types/search/_types/ISimpleSearchPatternMatcher";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IViewStackItemView} from "../../../uiLayers/_types/IViewStackItem";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IMenu} from "../../menu/_types/IMenu";
import {IRecursiveSearchChildren} from "../../../actions/types/search/tracedRecursiveSearch/_types/IRecursiveSearchChildren";
import {IShortcutInput} from "./IShortcutInput";
import {IExecutable} from "../../../actions/types/execute/_types/IExecutable";
import {IUUID} from "../../../_types/IUUID";

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
    content?: IViewStackItemView;

    /** The category to put the item under in the menu */
    category?: ICategory;

    /** Bindings to additional actions */
    actionBindings?: ISubscribable<IActionBinding[]>;

    /** Bindings to additional actions that  use the item's identity */
    identityActionBindings?: (identityID: IUUID) => ISubscribable<IActionBinding[]>;

    /** A pattern matcher that can be used to capture patterns in a search and highlight them */
    searchPattern?: ISimpleSearchPatternMatcher;

    /** The children that should be included in searches, defaults to undefined*/
    searchChildren?: IRecursiveSearchChildren;

    // Event listeners
    /** The function to execute when executing the menu item's default action */
    onExecute?: IExecutable;

    /** A listener to execute side effects when the item is selected or deselected */
    onSelect?: (selected: boolean, menu: IMenu) => void;

    /** A listener to execute side effects when the item becomes the cursor */
    onCursor?: (isCursor: boolean, menu: IMenu) => void;

    /** A listener to track what menus an item is added to */
    onMenuChange?: (menu: IMenu, added: boolean) => void;

    /** Shows a given child in the list of children */
    onShowChild?: IShowChildInParent;
};
