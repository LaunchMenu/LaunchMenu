import {
    createGlobalContextBinding,
    createStandardMenuItem,
    IActionBinding,
    LaunchMenu,
} from "@launchmenu/core";
import {settings} from "../settings";
import {windowManagementFolderHandler} from "./windowManagementFolderHandler";

/**
 * Creates the context menu binding to hide the window
 * @param LaunchMenu The LaunchMenu instance
 * @param hideWindow The callback to call to exit the window
 * @returns An action binding for the context menu to hide the window
 */
export function createExitContextMenuBinding(
    LM: LaunchMenu,
    hideWindow: () => void
): IActionBinding[] {
    return [
        createGlobalContextBinding(
            {
                priority: 3,
                item: createStandardMenuItem({
                    name: "Exit",
                    onExecute: hideWindow,
                    shortcut: context =>
                        context.settings.get(settings).controls.exit.get(),
                }),
            },
            windowManagementFolderHandler
        ),
        createGlobalContextBinding(
            {
                priority: 1,
                item: createStandardMenuItem({
                    name: "Restart",
                    onExecute: () => LM.restart(),
                    shortcut: context =>
                        context.settings.get(settings).controls.restart.get(),
                }),
            },
            windowManagementFolderHandler
        ),
        createGlobalContextBinding(
            {
                priority: 1,
                item: createStandardMenuItem({
                    name: "Shutdown",
                    onExecute: close,
                    shortcut: context =>
                        context.settings.get(settings).controls.shutdown.get(),
                }),
            },
            windowManagementFolderHandler
        ),
    ];
}
