import {isPlatform} from "@launchmenu/core";
import {remote, BrowserWindow} from "electron";

/**
 * Returns focus to the previously selected program
 * @param window The window that had focus
 * @remark https://stackoverflow.com/a/55104179/6302131
 */
export function returnFocus(window: BrowserWindow): void {
    if (isPlatform("mac")) {
        remote.app.hide();
    } else {
        window.minimize();
    }
}
