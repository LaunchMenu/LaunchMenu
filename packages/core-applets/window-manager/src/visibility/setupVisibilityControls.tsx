import {IActionBinding, Observer, SettingsManager} from "@launchmenu/core";
import {Tray, remote, nativeImage, BrowserWindow} from "electron";
import Path from "path";
import {settings} from "../settings";
import {createExitContextMenuBinding} from "./createExitContextMenuBinding";

/**
 * Sets up all listeners and UI to control window visibility
 * @param settingsManager The settings manager to obtain the settings from
 * @param window The window to control the visibility of
 * @param onHide A callback for when the window hides
 * @returns A function to remove the listeners and a context menu binding
 */
export function setupVisibilityControls(
    settingsManager: SettingsManager,
    window: BrowserWindow,
    onHide: () => void
): {destroy: () => void; exitBinding: IActionBinding} {
    const showWindow = () => {
        window.show();
        window.focus();
    };
    const hideWindow = () => {
        if (!window.isVisible()) return;
        window.hide();
        onHide();
    };

    // Setup the tray icon
    let tray: Tray | undefined;
    try {
        tray = new remote.Tray(nativeImage.createEmpty());
        tray.setImage(
            nativeImage.createFromPath(
                Path.join(__dirname, "..", "..", "images", "trayIcon.png")
            )
        );

        tray.setTitle("LaunchMenu");
        tray.setToolTip("LaunchMenu");
        tray.on("click", () => {
            showWindow();
        });
    } catch (e) {
        console.error(e);
    }

    // Auto hide when losing focus
    const hideSettingObserver = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).visibility.hideOnBlur.get(h)
    ).listen(hideOnBlur => {
        window.removeListener("blur", hideWindow);
        if (hideOnBlur) window.on("blur", hideWindow);
    }, true);

    // Shortcut handler
    let lastShortcut: null | string = null;
    const shortcutSettingObserver = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).controls.open.get(h)
    ).listen(pattern => {
        lastShortcut = pattern;
        remote.globalShortcut.register(pattern, showWindow);
    }, true);

    // Debug handler
    const debugSettingObvserver = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).visibility.showDebugger.get(h)
    ).listen(visible => {
        const wc = window.webContents;
        if (visible == "true") wc.openDevTools({mode: "detach"});
        else if (visible == "false") wc.closeDevTools();
        else {
            // TODO: add a property to track dev mode in LM
            if ((global as any).DEV) wc.openDevTools({mode: "detach"});
            else wc.closeDevTools();
        }
    }, true);

    // Return a function to dispose all listeners
    return {
        destroy: () => {
            tray?.destroy();
            window.removeListener("blur", hideWindow);
            shortcutSettingObserver.destroy();
            hideSettingObserver.destroy();
            debugSettingObvserver.destroy();
            if (lastShortcut) remote.globalShortcut.unregister(lastShortcut);
        },
        exitBinding: createExitContextMenuBinding(hideWindow),
    };
}
