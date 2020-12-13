import {globalShortcut} from "electron";

/**
 * A class to manage shortcuts. Only accessible in the main process. Within a window, one can manage global shortcuts through `LaunchMenu.getWindowManager().addGlobalShortcut(...)`
 */
export class GlobalShortcutManager {
    protected listeners: Record<string, (() => void)[]> = {};

    /**
     * Creates a new instance of the shortcut manager. Only a single instance should exist.
     */
    public constructor() {
        if (!globalShortcut)
            throw Error("GlobalShortcutManager is only accessible from the main process");
    }

    /**
     * Adds a new global shortcut
     * @param shortcut The shortcut to listen for, see https://www.electronjs.org/docs/api/accelerator
     * @param listener The callback to invoke when the shortcut is triggered
     */
    public addShortcut(shortcut: string, listener: () => void): void {
        if (!this.listeners[shortcut]) {
            this.listeners[shortcut] = [];
            globalShortcut.register(shortcut, () => {
                this.listeners[shortcut].forEach(listener => listener());
            });
        }

        this.listeners[shortcut].push(listener);
    }

    /**
     * Remove  a new global shortcut
     * @param shortcut The shortcut that was listened for, see https://www.electronjs.org/docs/api/accelerator
     * @param listener The callback that was invoked when the shortcut was triggered
     */
    public removeShortcut(shortcut: string, listener: () => void): void {
        const listeners = this.listeners[shortcut];
        if (!listeners) return;

        const index = listeners.indexOf(listener);
        if (index == -1) return;

        listeners.splice(index, 1);
        if (listeners.length == 0) {
            delete this.listeners[shortcut];
            globalShortcut.unregister(shortcut);
        }
    }
}
