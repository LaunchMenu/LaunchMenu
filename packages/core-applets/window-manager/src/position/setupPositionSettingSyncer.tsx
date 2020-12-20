import {Observer, SettingsManager} from "@launchmenu/core";
import {BrowserWindow} from "electron";
import {settings} from "../settings";

/**
 * Sets up the synchronisation between the position setting, and the window position
 * @param settingsManager The settings manager to obtain the settings from
 * @param window The window to be moved by the setting
 * @returns A function that can be used to destroy the connection
 */
export function setupPositionSettingSyncer(
    settingsManager: SettingsManager,
    window: BrowserWindow
): () => void {
    let timeoutID: number | undefined;
    const observer = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).position.get(h)
    ).listen(({x, y}) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            window.setPosition(x, y);
        }, 100) as any;
    });

    return () => observer.destroy();
}
