import {BrowserWindow, shell} from "electron";
import Path from "path";

export class WindowController {
    protected window: BrowserWindow;

    /**
     * Creates a new window manager
     * @param shortcutManager The shortcut manager to manage the global shortcuts
     */
    public constructor() {
        // Create the browser window
        this.window = new BrowserWindow({
            width: 700,
            height: 450,
            frame: false,
            transparent: true,
            resizable: false,
            show: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
            },
        });
        this.window.menuBarVisible = false;

        // Load the index.html of the app
        const indexPath = Path.join(__dirname, "index.html");
        this.window.loadURL(indexPath);

        // Handle links
        this.window.webContents.on("new-window", (event, url) => {
            event.preventDefault();
            shell.openExternal(url);
        });
    }

    /**
     * Destroy the window manager and the window(s) it is managing
     */
    public destroy(): void {
        this.window.destroy();
    }
}
