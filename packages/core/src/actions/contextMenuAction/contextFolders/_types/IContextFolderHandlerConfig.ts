import {IStandardMenuItemData} from "../../../../menus/items/_types/IStandardMenuItemData";
import {IPriority} from "../../../../menus/menu/priority/_types/IPriority";
import {IContextFolderAction} from "./IContextFolderAction";

export type IContextFolderHandlerConfig = {
    /** The name of the folder, used for debugging */
    name: string;
    /** The priority the item has in the context menu */
    priority: IPriority;
    /** The item to be shown, or data to create the item. Debug name will be used if name is left out */
    itemData?: IStandardMenuItemData & {
        /** A name for the path (defaults to the item name)*/
        pathName?: string;
        /** Whether to prevent recursive search into this directory (defaults to false) */
        preventSearch?: boolean;
        /** Whether to close the menu when an active item is executed (defaults to true) */
        closeOnExecute?: boolean;
        /** Whether to forward the key events passed to this item to the item's children (defaults to true) */
        forwardKeyEvents?: boolean;
    };
    /**
     * The root folder action for which to override the context item, if all its bindings (children) originate from this action.
     * Bindings to this folder will automatically be treated as bindings to the override folder too.
     * This will automatically override any ancestor overrides too (overrides specified by our ancestors).
     */
    override?: IContextFolderAction;
    /** Whether to prevent adding the count category to the item, defaults to false */
    preventCountCategory?: boolean;
    /** The folder that this folder should appear in */
    parent?: IContextFolderAction;
};
