import {IActionBinding, LaunchMenu} from "@launchmenu/core";
import {Tray, remote, nativeImage, BrowserWindow} from "electron";
import {Observer} from "model-react";
import Path from "path";
import {settings} from "../settings";
import {createExitContextMenuBinding} from "./createExitContextMenuBindings";

/**
 * Sets up all listeners and UI to control window visibility
 * @param LM The LaunchMenu instance to do stuff with
 * @param window The window to control the visibility of
 * @param onHide A callback for when the window hides
 * @returns A function to remove the listeners and a context menu binding
 */
export function setupVisibilityControls(
    LM: LaunchMenu,
    window: BrowserWindow,
    onHide: () => void
): {destroy: () => void; exitBindings: IActionBinding[]} {
    const settingsManager = LM.getSettingsManager();

    // Create show and hide functions, that deal with the fact that transitions don't run while the window is hidden
    const showWindow = () => {
        const pos = settingsManager.getSettingsContext().get(settings).position.get();

        document.body.classList.add("noTransition");
        window.setPosition(-5e3, -5e3);
        setTimeout(() => {
            window.setPosition(pos.x, pos.y);
            document.body.classList.remove("noTransition");
        }, 100);

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
    let latestShortcut: null | string = null;
    const shortcutSettingObserver = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).controls.open.get(h)
    ).listen(pattern => {
        latestShortcut = pattern;
        remote.globalShortcut.register(pattern, showWindow);
    }, true);

    // Debug handler
    const debugSettingObvserver = new Observer(h => ({
        visible: settingsManager
            .getSettingsContext(h)
            .get(settings)
            .visibility.showDebugger.get(h),
        devMode: LM.isInDevMode(h),
    })).listen(({visible, devMode}) => {
        const wc = window.webContents;
        if (visible == "true") wc.openDevTools({mode: "detach"});
        else if (visible == "false") wc.closeDevTools();
        else {
            if (devMode) wc.openDevTools({mode: "detach"});
            else wc.closeDevTools();
        }
    }, true);

    // Setup a listener to hide the window when hitting escape when in the home screen
    const exitListener = hideWindow;
    const sessionObserver = new Observer(h =>
        LM.getSessionManager().getSessions(h)
    ).listen(sessions => {
        // Sessions can't register duplicate listeners, so calling it more often does no harm
        sessions.forEach(session => session.addCloseListener(exitListener));
    }, true);

    // Return a function to dispose all listeners
    return {
        destroy: () => {
            tray?.destroy();
            window.removeListener("blur", hideWindow);
            shortcutSettingObserver.destroy();
            hideSettingObserver.destroy();
            debugSettingObvserver.destroy();
            sessionObserver.destroy();
            LM.getSessionManager()
                .getSessions()
                .forEach(session => session.removeCloseListener(exitListener));
            if (latestShortcut) remote.globalShortcut.unregister(latestShortcut);
        },
        exitBindings: createExitContextMenuBinding(LM, hideWindow),
    };
}
