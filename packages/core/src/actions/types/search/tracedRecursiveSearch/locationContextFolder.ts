import {Priority} from "../../../../menus/menu/priority/Priority";
import {createContextFolderHandler} from "../../../contextMenuAction/contextFolders/createContextFolderHandler";

/**
 * A location folder for the context menu
 */
export const locationContextFolder = createContextFolderHandler({
    name: "Location",
    priority: [Priority.HIGH, Priority.HIGH],
});
