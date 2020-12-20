import {BrowserWindow, OpenDevToolsOptions, shell} from "electron";
import Path from "path";
import {IPosition} from "../application/window/_types/IPosition";
import {ISize} from "../application/window/_types/ISize";
import {GlobalShortcutManager} from "./GlobalShortcutManager";
import {screen} from "electron";

function winReturnFocus() {
    const dummyTransparentWindow = new BrowserWindow({
        width: 1,
        height: 1,
        x: -100,
        y: -100,
        transparent: true,
        frame: false,
    });
    dummyTransparentWindow.close();
}

export class WindowController {
    protected window: BrowserWindow;
    protected globalShortcuts: Record<string, () => void> = {};
    protected shortcutManager: GlobalShortcutManager;

    /**
     * Creates a new window manager
     * @param shortcutManager The shortcut manager to manage the global shortcuts
     */
    public constructor(shortcutManager: GlobalShortcutManager) {
        this.shortcutManager = shortcutManager;

        // Create the browser window
        this.window = new BrowserWindow({
            width: 700,
            height: 450,
            frame: false,
            transparent: true,
            resizable: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
            },
        });
        this.window.menuBarVisible = false;

        // Load the index.html of the app
        const indexPath = Path.join(__dirname, "index.html");
        this.window.loadURL(indexPath);
        if (DEV) this.window.webContents.openDevTools({mode: "detach"});

        // Handle links
        this.window.webContents.on("new-window", (event, url) => {
            event.preventDefault();
            shell.openExternal(url);
        });

        // Setup all listeners
        this.setup();
    }

    /**
     * Sets up all event listeners, and send the initial data
     */
    protected setup(): void {
        const wc = this.window.webContents;

        // Track when move and resize commands were received, to block feedback loops
        let moveTime = Date.now();
        let latestProgrammaticMove: IPosition = {x: -Infinity, y: -Infinity};
        let resizeTime = Date.now();
        let latestProgrammaticResize: ISize = {width: -Infinity, height: -Infinity};

        // Setup window manager event listeners
        const listeners = {
            "window-set-position": (position: IPosition) => {
                if (Date.now() - moveTime <= 100) return;
                latestProgrammaticMove = position;
                this.window.setPosition(position.x, position.y);
            },
            "window-set-size": (size: ISize) => {
                if (Date.now() - resizeTime <= 100) return;
                latestProgrammaticResize = size;
                this.window.setSize(size.width, size.height);
            },
            "window-set-resizable": (resizable: boolean) => {
                this.window.setResizable(resizable);
            },
            "window-set-visible": (visible: boolean) => {
                if (visible) {
                    this.window.show();
                    this.window.focus();
                } else {
                    this.window.hide();
                    this.window.blur();
                    winReturnFocus();
                }
            },
            "window-set-debugger-visible": (
                visible: boolean,
                options: OpenDevToolsOptions
            ) => {
                if (visible) wc.openDevTools(options ?? {mode: "detach"});
                else wc.closeDevTools();
            },
            "window-add-globalShortcut": (shortcut: string) => {
                if (!this.globalShortcuts[shortcut]) {
                    this.globalShortcuts[shortcut] = () =>
                        wc.send("window-trigger-globalShortcut", shortcut);
                    this.shortcutManager.addShortcut(
                        shortcut,
                        this.globalShortcuts[shortcut]
                    );
                }
            },
            "window-remove-globalShortcut": (shortcut: string) => {
                if (this.globalShortcuts[shortcut]) {
                    this.shortcutManager.removeShortcut(
                        shortcut,
                        this.globalShortcuts[shortcut]
                    );
                    delete this.globalShortcuts[shortcut];
                }
            },
            "window-get-displays": () => ({
                all: screen.getAllDisplays().map(display => display.bounds),
                primary: screen.getPrimaryDisplay().bounds,
            }),
        };
        // wc.on("ipc-message", (event, channel, ...args) => {
        //     (listeners as any)[channel]?.(...args);
        // });
        // wc.on("ipc-message-sync", (event, channel, ...args) => {
        //     const resp = (listeners as any)[channel]?.(...args);
        //     event.returnValue = resp;
        // });

        // Setup window event listeners
        this.window.on("blur", () => wc.send("window-blur"));
        this.window.on("focus", () => wc.send("window-focus"));
        this.window.on("move", () => {
            const [x, y] = this.window.getPosition();
            if (x != latestProgrammaticMove.x || y != latestProgrammaticMove.y)
                moveTime = Date.now();
            wc.send("window-position-change", {x, y});
        });
        this.window.on("resize", () => {
            const [width, height] = this.window.getSize();
            if (
                width != latestProgrammaticResize.width ||
                height != latestProgrammaticResize.height
            )
                resizeTime = Date.now();
            wc.send("window-size-change", {width, height});
        });
    }

    /**
     * Destroy the window manager and the window(s) it is managing
     */
    public destroy(): void {
        Object.entries(this.globalShortcuts).forEach(([shortcut, listener]) =>
            this.shortcutManager.removeShortcut(shortcut, listener)
        );
        this.window.destroy();
    }
}
