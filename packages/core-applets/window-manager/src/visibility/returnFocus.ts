import {remote} from "electron";

/**
 * Returns focus to the previously selected program
 */
export function returnFocus(): void {
    // Ugly (hopefully temporary) workaround until a proper fix exists, source: https://github.com/electron/electron/issues/3472#issuecomment-617575845
    const dummyTransparentWindow = new remote.BrowserWindow({
        width: 1,
        height: 1,
        x: -100,
        y: -100,
        transparent: true,
        frame: false,
    });
    dummyTransparentWindow.close();
}
