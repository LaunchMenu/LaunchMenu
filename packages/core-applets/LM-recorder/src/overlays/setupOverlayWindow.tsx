import {IDataRetriever, Observer} from "model-react";
import {IRemoteElement} from "./window/_types/IRemoteElement";
import {remote} from "electron";
import {IRect} from "./window/_types/IRect";
import Path from "path";

/**
 * Sets up a window to show overlays
 * @param config The window configuration
 * @returns A function to dispose the window
 */
export async function setupOverlayWindow({
    overlays,
    state,
    themePath,
    windowBox,
    cursorVisible,
    showDebug = false,
}: {
    /** The overlays to be displayed */
    overlays: IDataRetriever<IRemoteElement[]>;
    /** The state to pass to the elements */
    state: IDataRetriever<Partial<Object>>;
    /** The theme to be used by the overlays */
    themePath: IDataRetriever<string | undefined>;
    /** The size and position of the overlay window */
    windowBox: IDataRetriever<IRect>;
    /** Whether the cursor should be visible */
    cursorVisible: IDataRetriever<boolean>;
    /** Whether the debug window should be shown */
    showDebug?: boolean;
}): Promise<() => void> {
    const initBox = windowBox();
    const window = new remote.BrowserWindow({
        ...initBox,
        frame: false,
        transparent: true,
        resizable: false,
        show: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
        },
    });
    const indexPath = Path.join(__dirname, "window", "index.html");
    window.loadURL(indexPath);
    window.setAlwaysOnTop(true, "modal-panel");
    window.setContentSize(initBox.width, initBox.height);
    window.setSkipTaskbar(true);
    if (showDebug) window.webContents.openDevTools();

    // Setup the box observer
    const boxObserver = new Observer(windowBox, {debounce: -1}).listen(box => {
        window.setPosition(box.x, box.y);
        window.setSize(box.width, box.height);
        window.setContentSize(box.width, box.height);
    });

    // Setup the state observers
    const overlaysObserver = new Observer(overlays, {debounce: -1}).listen(overlays => {
        window.webContents.send("updateComps", overlays);
    }, true);
    const stateObserver = new Observer(state, {debounce: -1}).listen(state => {
        window.webContents.send("updateState", state);
    }, true);
    const themeObserver = new Observer(themePath, {debounce: -1}).listen(theme => {
        window.webContents.send("updateTheme", theme);
    }, true);
    const cursorVisibleObserver = new Observer(cursorVisible, {debounce: -1}).listen(
        visible => {
            window.setIgnoreMouseEvents(visible);
        },
        true
    );

    // Wait for the window to load
    await new Promise<void>(res => window.webContents.on("did-finish-load", res));
    window.showInactive();

    // Return the function to dispose everything
    return () => {
        boxObserver.destroy();
        overlaysObserver.destroy();
        stateObserver.destroy();
        themeObserver.destroy();
        cursorVisibleObserver.destroy();
        window.destroy();
    };
}
