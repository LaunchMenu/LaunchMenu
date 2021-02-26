import {createContextFolderHandler} from "../../actions/contextMenuAction/contextFolders/createContextFolderHandler";
import {IContextFolderAction} from "../../actions/contextMenuAction/contextFolders/_types/IContextFolderAction";
import {IContextFolderHandlerConfig} from "../../actions/contextMenuAction/contextFolders/_types/IContextFolderHandlerConfig";
import {IContextMenuItemData} from "../../actions/contextMenuAction/_types/IContextMenuItemData";
import {IAction} from "../../actions/_types/IAction";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {Priority} from "../../menus/menu/priority/Priority";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";

/**
 * The default folder for all global context menu actions
 */
export const globalContextFolderHandler = createContextFolderHandler({
    name: "Global",
    priority: [Priority.LOW, Priority.LOW, Priority.LOW],
    preventCountCategory: true,
});

/**
 * Creates a binding for a global context menu item
 * @param item The item to add to the menu
 * @param folder The folder to add the item to
 * @returns The context action binding
 */
export function createGlobalContextBinding(
    item: IPrioritizedMenuItem,
    folder: IContextFolderAction = globalContextFolderHandler
): IActionBinding<IAction<IContextMenuItemData, IContextMenuItemData[], any>> {
    return folder.createBinding({item, action: null, preventCountCategory: true});
}

/**
 * Creates a subfolder for the global context folder
 * @param config The folder configuration
 * @returns The folder handler action
 */
export function createGlobalContextFolderHandler(
    config: IContextFolderHandlerConfig
): IContextFolderAction {
    return createContextFolderHandler({
        parent: globalContextFolderHandler,
        preventCountCategory: true,
        ...config,
    });
}
