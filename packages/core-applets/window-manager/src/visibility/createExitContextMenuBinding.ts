import {
    contextMenuAction,
    createStandardMenuItem,
    globalContextFolderHandler,
    IActionBinding,
} from "@launchmenu/core";
import {settings} from "../settings";

/**
 * Creates the context menu binding to hide the window
 * @param onExecute The callback to call to exit the window
 * @returns An action binding for the context menu to hide the window
 */
export function createExitContextMenuBinding(onExecute: () => void): IActionBinding {
    return globalContextFolderHandler.createBinding({
        action: null,
        preventCountCategory: true,
        item: {
            priority: 2,
            item: createStandardMenuItem({
                name: "Exit",
                onExecute,
                shortcut: context => context.settings.get(settings).controls.exit.get(),
            }),
        },
    });
}
