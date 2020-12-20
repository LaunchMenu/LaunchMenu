import {declare} from "@launchmenu/core";
import {remote} from "electron";
import {settings, settingsBrowserWindow} from "./settings";
import {setupPositionSettingSyncer} from "./position/setupPositionSettingSyncer";
import {setupSizeSettingSyncer} from "./size/setupSizeSettingSyncer";
import {setupVisibilityControls} from "./visibility/setupVisibilityControls";

export const info = {
    name: "Window manager",
    description: "An window to manage LaunchMenu's window",
    version: "0.0.0",
    icon: "search", // TODO: add some appropriate icon
};

export default declare({
    info,
    settings,
    withLM: LM => {
        const window = remote.getCurrentWindow();
        settingsBrowserWindow.set(window);
        const settingsManager = LM.getSettingsManager();

        // Setup visibility controls
        const {destroy: destroyVisibilityControls, exitBinding} = setupVisibilityControls(
            settingsManager,
            window,
            () => {
                LM.getKeyHandler().resetKeys();
            }
        );

        // Setup the position setting
        const destroyPositionSyncer = setupPositionSettingSyncer(settingsManager, window);

        // Setup the size setting
        const destroySizeSyncer = setupSizeSettingSyncer(settingsManager, window);
        return {
            globalContextMenuBindings: [exitBinding],
            onDispose: () => {
                destroyVisibilityControls();
                destroyPositionSyncer();
                destroySizeSyncer();
            },
        };
    },
});
