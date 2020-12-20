import {createContextFolderHandler} from "../../actions/contextMenuAction/contextFolders/createContextFolderHandler";
import {Priority} from "../../menus/menu/priority/Priority";

/**
 * The default folder for all global context menu actions
 */
export const globalContextFolderHandler = createContextFolderHandler({
    name: "Global",
    priority: Priority.LOW,
    preventCountCategory: true
});
