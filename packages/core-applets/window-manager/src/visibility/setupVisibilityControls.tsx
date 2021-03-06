import {IActionBinding, LaunchMenu} from "@launchmenu/core";
import {remote, BrowserWindow} from "electron";
import {Observer} from "model-react";
import {settings} from "../settings";
import {createExitContextMenuBinding} from "./createExitContextMenuBindings";
import {returnFocus} from "./returnFocus";

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

    // Synchronize with LM visibility state and deal with the fact that transitions don't run while the window is hidden
    const visibilityObserver = new Observer(h => LM.isWindowOpen(h), {
        debounce: -1,
    }).listen(open => {
        if (open) {
            document.body.classList.add("noTransition");
            setTimeout(() => {
                document.body.style.visibility = "inherit";
                document.body.classList.remove("noTransition");
            }, 50);

            window.show();
            window.focus();
        } else {
            if (!window.isVisible()) return;

            document.body.style.visibility = "hidden";
            document.body.getBoundingClientRect(); // Force reflow to hide the element visually asap

            setTimeout(() => {
                window.hide();
                onHide();
            }, 10);
            returnFocus();
        }
    });
    const hideWindow = () => LM.setWindowOpen(false);
    const showWindow = () => LM.setWindowOpen(true);

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
    const debugSettingObserver = new Observer(h => ({
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
            window.removeListener("blur", hideWindow);
            shortcutSettingObserver.destroy();
            hideSettingObserver.destroy();
            debugSettingObserver.destroy();
            visibilityObserver.destroy();
            sessionObserver.destroy();
            LM.getSessionManager()
                .getSessions()
                .forEach(session => session.removeCloseListener(exitListener));
            if (latestShortcut) remote.globalShortcut.unregister(latestShortcut);
        },
        exitBindings: createExitContextMenuBinding(LM, hideWindow),
    };
}
