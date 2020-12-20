import {Observer, SettingsManager} from "@launchmenu/core";
import {BrowserWindow} from "electron";
import {settings} from "../settings";

/**
 * Sets up the synchronisation between the size setting, and the window size
 * @param settingsManager The settings manager to obtain the settings from
 * @param window The window to be resized by the setting
 * @returns A function that can be used to destroy the connection
 */
export function setupSizeSettingSyncer(
    settingsManager: SettingsManager,
    window: BrowserWindow
): () => void {
    let timeoutID: number | undefined;
    const observer = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).size.get(h)
    ).listen(({width, height}) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            window.setContentSize(width, height);
        }, 100) as any;
    });

    return () => observer.destroy();
}
