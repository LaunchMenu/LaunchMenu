import {CoreAppletType, declare} from "@launchmenu/core";
import {remote} from "electron";
import {settings, info, settingsBrowserWindow} from "./settings";
import {setupPositionSettingSyncer} from "./position/setupPositionSettingSyncer";
import {setupSizeSettingSyncer} from "./size/setupSizeSettingSyncer";
import {setupVisibilityControls} from "./visibility/setupVisibilityControls";
import {returnFocus} from "./visibility/returnFocus";
import {setupStartupController} from "./startup/setupStartupController";
import {setupTrayMenu} from "./tray/setupTrayMenu";
import {windowIcon} from "./tray/icon";
import {setupFrame} from "./setupFrame";
import {ipcRenderer} from "electron/renderer";

export default declare({
    info,
    settings,
    coreCategory: CoreAppletType.WINDOW,
    init: ({LM, settings}) => {
        const window = remote.getCurrentWindow();
        settingsBrowserWindow.set(window);
        const settingsManager = LM.getSettingsManager();

        // Setup visibility controls
        const {destroy: destroyVisibilityControls, exitBindings} =
            setupVisibilityControls(LM, window, () => {
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

        // Setup the frame of the application
        const removeFrame = setupFrame(LM);

        // Set the window image
        remote.getCurrentWindow().setIcon(windowIcon);

        // Indicate that LM is now fully started
        ipcRenderer.send("LM-started");

        // Return disposer and global bindings
        return {
            globalContextMenuBindings: exitBindings,
            onDispose: () => {
                destroyWindowController();
                destroyVisibilityControls();
                destroyPositionSyncer();
                destroySizeSyncer();
                destroyTrayMenu();
                removeFrame();
            },
        };
    },
});
