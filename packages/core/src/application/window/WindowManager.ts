import {ipcRenderer, IpcRendererEvent, OpenDevToolsOptions} from "electron";
import {EventEmitter} from "events";
import {Field, IDataHook} from "model-react";
import {IDisplays} from "./_types/IDisplays";
import {IPosition} from "./_types/IPosition";
import {ISize} from "./_types/ISize";

/**
 * A class to manage the window, from within the window's process.
 * Communicates with the windowController over IPC in order to manage the window that this instance was created in.
 */
export class WindowManager {
    protected emitter = new EventEmitter();
    protected blurListener: () => void;
    protected focusListener: () => void;

    protected positionListener: (event: IpcRendererEvent, position: IPosition) => void;
    protected sizeListener: (event: IpcRendererEvent, size: ISize) => void;
    protected position = new Field({x: 0, y: 0});
    protected size = new Field({width: 0, height: 0});

    protected visible = new Field(false);
    protected debuggerVisible = new Field(false);

    protected shortcutListener: (event: IpcRendererEvent, shortcut: string) => void;
    protected globalShortcutListeners: Record<string, (() => void)[]> = {};

    /**
     * A new instance should only be created by LaunchMenu, not by applets.
     * This main instance is accessible from the main LaunchMenu entry.
     */
    public constructor() {
        this.setup();
    }

    /**
     * Sets up the window manager, with all its IPC listeners
     */
    protected setup(): void {
        this.focusListener = () => this.emitter.emit("focus");
        this.blurListener = () => this.emitter.emit("blur");
        ipcRenderer.on("window-focus", this.focusListener);
        ipcRenderer.on("window-blur", this.blurListener);

        this.positionListener = (e, position) => this.setPosition(position);
        this.sizeListener = (e, size) => this.setSize(size);
        ipcRenderer.on("window-position-change", this.positionListener);
        ipcRenderer.on("window-size-change", this.sizeListener);

        this.shortcutListener = (e, shortcut) =>
            this.globalShortcutListeners[shortcut]?.forEach(listener => listener());
        ipcRenderer.on("window-trigger-globalShortcut", this.shortcutListener);
    }

    /**
     * Destroys the window manager and disposes of all the listeners
     */
    public destroy(): void {
        ipcRenderer.off("window-focus", this.focusListener);
        ipcRenderer.off("window-blur", this.blurListener);
        ipcRenderer.off("window-position-change", this.positionListener);
        ipcRenderer.off("window-size-change", this.sizeListener);
        ipcRenderer.off("window-trigger-globalShortcut", this.shortcutListener);
    }

    /* Visibility */
    /**
     * Sets whether the window is visible or not
     * @param visible Whether the window is visible
     */
    public setVisible(visible: boolean): void {
        this.visible.set(visible);
        ipcRenderer.send("window-set-visible", visible);
    }

    /**
     * Retrieves whether the window is visible or not
     * @param hook The hook to subscribe to changes
     * @returns Whether or not visible
     */
    public isVisible(hook: IDataHook = null): boolean {
        return this.visible.get(hook);
    }

    /**
     * Sets whether the window's debugger is visible or not
     * @param visible Whether the window's debugger is visible
     * @param config Any options for the debugger
     */
    public setDebuggerVisible(visible: boolean, config?: OpenDevToolsOptions): void {
        this.debuggerVisible.set(visible);
        ipcRenderer.send("window-set-debugger-visible", visible, config);
    }

    /**
     * Retrieves whether the window's debugger is visible or not
     * @param hook The hook to subscribe to changes
     * @returns Whether or not visible
     */
    public isDebuggerVisible(hook: IDataHook = null): boolean {
        return this.debuggerVisible.get(hook);
    }

    /* Global shortcut listeners */
    /**
     * Adds a listener for a global shortcut
     * @param shortcut The shortcut to listener for, see https://www.electronjs.org/docs/api/accelerator
     * @param listener The listener to add
     */
    public addGlobalShortcut(shortcut: string, listener: () => void): void {
        if (!this.globalShortcutListeners[shortcut]) {
            ipcRenderer.send("window-add-globalShortcut", shortcut);
            this.globalShortcutListeners[shortcut] = [];
        }
        this.globalShortcutListeners[shortcut].push(listener);
    }

    /**
     * Removes a listener for a global shortcut
     * @param shortcut The shortcut to stop listener for, see https://www.electronjs.org/docs/api/accelerator
     * @param listener The listener to remove
     */
    public removeGlobalShortcut(shortcut: string, listener: () => void): void {
        const listeners = this.globalShortcutListeners[shortcut];
        if (!listeners) return;

        const index = listeners.indexOf(listener);
        if (index == -1) return;

        listeners.splice(index, 1);
        if (listeners.length == 0) {
            delete this.globalShortcutListeners[shortcut];
            ipcRenderer.send("window-remove-globalShortcut", shortcut);
        }
    }

    /* Position and size */
    /**
     * Sets the size of the window
     * @param size The new size of the window
     */
    public setSize(size: ISize): void {
        const current = this.size.get(null);
        if (current.width == size.width && current.height == size.height) return;
        this.size.set(size);
        ipcRenderer.send("window-set-size", size);
    }

    /**
     * Sets the position of the window
     * @param position The new position of the window
     */
    public setPosition(position: IPosition): void {
        const current = this.position.get(null);
        if (current.x == position.x && current.y == position.y) return;
        this.position.set(position);
        ipcRenderer.send("window-set-position", position);
    }

    /**
     * Retrieves the size of the window
     * @param hook The hook to subscribe to changes
     * @returns The current size of the window
     */
    public getSize(hook: IDataHook = null): ISize {
        return this.size.get(hook);
    }

    /**
     * Retrieves the position of the window
     * @param hook The hook to subscribe to changes
     * @returns The current position of the window
     */
    public getPosition(hook: IDataHook = null): IPosition {
        return this.position.get(hook);
    }

    /**
     * Retrieves the display data
     * @returns The display regions
     */
    public getDisplays(): IDisplays {
        return ipcRenderer.sendSync("window-get-displays");
    }

    /* Events */
    /**
     * Adds an event listener to listen to window blur events, triggering when the window loses focus
     * @param event The blur event to listen to
     * @param listener The blur listener
     */
    public on(event: "blur", listener: () => void): void;

    /**
     * Adds an event listener to listen to window focus events, triggering when the window gains focus
     * @param event The focus event to listen to
     * @param listener The focus listener
     */
    public on(event: "focus", listener: () => void): void;
    public on(event: string, listener: (...args: any[]) => void): void {
        this.emitter.on(event, listener);
    }

    /**
     * Removes an event listener that listened to window blur events
     * @param event The blur event that was listened to
     * @param listener The listener
     */
    public off(event: "blur", listener: () => void): void;

    /**
     * Removes an event listener that listened to window focus events
     * @param event The focus event that was listened to
     * @param listener The listener
     */
    public off(event: "focus", listener: () => void): void;
    public off(event: string, listener: (...args: any[]) => void): void {
        this.emitter.off(event, listener);
    }
}
