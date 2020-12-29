import {createGlobalContextFolderHandler, Priority} from "@launchmenu/core";

/**
 * The default folder for the window controls
 */
export const windowManagementFolderHandler = createGlobalContextFolderHandler({
    name: "Window management",
    priority: Priority.HIGH,
});
