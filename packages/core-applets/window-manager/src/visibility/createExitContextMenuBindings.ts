import {
    createGlobalContextBinding,
    createStandardMenuItem,
    IActionBinding,
    LaunchMenu,
    LMSession,
    Priority,
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
                priority: Priority.HIGH,
                item: createStandardMenuItem({
                    name: "Exit",
                    onExecute: () => {
                        const session = LM.getSessionManager().getSelectedSession();
                        session?.goHome();
                        hideWindow();
                    },
                    shortcut: context =>
                        context.settings.get(settings).controls.exit.get(),
                }),
            },
            windowManagementFolderHandler
        ),
        createGlobalContextBinding(
            {
                priority: Priority.MEDIUM,
                item: createStandardMenuItem({
                    name: "Exit keep state",
                    onExecute: hideWindow,
                    shortcut: context =>
                        context.settings.get(settings).controls.exitState.get(),
                }),
            },
            windowManagementFolderHandler
        ),
        createGlobalContextBinding(
            {
                priority: Priority.LOW,
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
                priority: [Priority.LOW, Priority.LOW],
                item: createStandardMenuItem({
                    name: "Quit",
                    onExecute: () => LM.shutdown(),
                    shortcut: context =>
                        context.settings.get(settings).controls.shutdown.get(),
                }),
            },
            windowManagementFolderHandler
        ),
    ];
}
