import {SettingsManager} from "@launchmenu/core";
import {BrowserWindow} from "electron";
import {Observer} from "model-react";
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
    // Sync the setting to the position
    const observer = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).position.get(h)
    ).listen(({x, y}) => {
        const [pX, pY] = window.getPosition();
        if (pX != x || pY != y) window.setPosition(x, y);
    }, true);

    // Sync the position to the setting
    let timeoutID: number | undefined;
    const positionListener = () => {
        const [x, y] = window.getPosition();
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            const field = settingsManager.getSettingsContext().get(settings).position;
            field.set({x, y});
        }, 100) as any;
    };
    window.on("move", positionListener);

    return () => {
        observer.destroy();
        window.removeListener("move", positionListener);
    };
}
