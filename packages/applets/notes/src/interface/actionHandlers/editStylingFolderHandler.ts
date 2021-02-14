import {createContextFolderHandler, Priority} from "@launchmenu/core";

/** A folder to place the style alteration actions under in the context menu */
export const editStylingFolderHandler = createContextFolderHandler({
    name: "Edit styling",
    priority: Priority.MEDIUM,
});
