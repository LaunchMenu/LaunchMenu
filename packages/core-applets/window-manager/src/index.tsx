import {CoreAppletType, declare} from "@launchmenu/core";
import {remote} from "electron";
import {settings, settingsBrowserWindow} from "./settings";
import {setupPositionSettingSyncer} from "./position/setupPositionSettingSyncer";
import {setupSizeSettingSyncer} from "./size/setupSizeSettingSyncer";
import {setupVisibilityControls} from "./visibility/setupVisibilityControls";
import {returnFocus} from "./visibility/returnFocus";
import {setupStartupController} from "./startup/setupStartupController";
import {setupTrayMenu} from "./tray/setupTrayMenu";
import {windowIcon} from "./tray/icon";

export const info = {
    name: "Window manager",
    description: "An window to manage LaunchMenu's window",
    version: "0.0.0",
    icon: "window",
} as const;

export default declare({
    info,
    settings,
    coreCategory: CoreAppletType.WINDOW,
    init: ({LM}) => {
        const window = remote.getCurrentWindow();
        settingsBrowserWindow.set(window);
        const settingsManager = LM.getSettingsManager();

        // Setup visibility controls
        const {
            destroy: destroyVisibilityControls,
            exitBindings,
        } = setupVisibilityControls(LM, window, () => {
            returnFocus(window);
        });

        // Setup startup controls
        const destroyWindowController = setupStartupController(settingsManager, h =>
            LM.isInDevMode(h)
        );

        // Setup the tray menu
        const destroyTrayMenu = setupTrayMenu(LM);

        // Setup the size setting
        const destroySizeSyncer = setupSizeSettingSyncer(settingsManager, window);

        // Setup the position setting
        const destroyPositionSyncer = setupPositionSettingSyncer(settingsManager, window);

        // Set the window image
        remote.getCurrentWindow().setIcon(windowIcon);
        return {
            globalContextMenuBindings: exitBindings,
            onDispose: () => {
                destroyWindowController();
                destroyVisibilityControls();
                destroyPositionSyncer();
                destroySizeSyncer();
                destroyTrayMenu();
            },
        };
    },
});
