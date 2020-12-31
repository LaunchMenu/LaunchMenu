import {
    createGlobalContextFolderHandler,
    globalContextFolderHandler,
    Priority,
} from "@launchmenu/core";

/**
 * A settings context folder handler to store settings related items in
 */
export const settingsFolderHandler = createGlobalContextFolderHandler({
    name: "Settings",
    priority: [Priority.LOW, Priority.LOW],
    parent: globalContextFolderHandler,
});
