import {IPrioritizedMenuCategoryConfig} from "../../../../menus/menu/_types/IAsyncMenuCategoryConfig";
import {IMenu} from "../../../../menus/menu/_types/IMenu";
import {IMenuItemExecuteCallback} from "../../../../menus/menu/_types/IMenuItemExecuteCallback";
import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";

/** The configuration */
export type IMenuSearchConfig = {
    /** The highlighter to be used for the search (defaults to plain text) */
    highlighter?: IHighlighter;
    /** Whether to highlight found patterns (defaults to true) */
    usePatternHighlighter?: boolean;
    /** Initial search text */
    text?: string;
    /** Initial text selection */
    selection?: ITextSelection;

    /** The menu this field should search in */
    menu: IMenu;
    /** Category configuration for the search results */
    categoryConfig?: IPrioritizedMenuCategoryConfig;
    /** The callback to make when an item is executed */
    onExecute?: IMenuItemExecuteCallback;
    /** Whether to use key handler of items in the menu search menu */
    useItemKeyHandlers?: boolean;
    /** Whether to use key handlers of items in the context menu of the selected item(s) of the search menu */
    useContextItemKeyHandlers?: boolean;
};
