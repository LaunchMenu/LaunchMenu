import {BrowserWindow} from "electron";
import Path from "path";
import hmr from "@launchmenu/hmr";

export class WindowManager {
    protected window: BrowserWindow;

    /**
     * Creates a new window manager
     */
    public constructor() {
        // Create the browser window.
        this.window = new BrowserWindow({
            width: 700,
            height: 450,
            // frame: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
            },
        });
        this.window.on("blur", () => this.window.webContents.send("blur"));
        const indexPath = Path.join(__dirname, "index.html");

        // and load the index.html of the app.
        if (DEV) {
            // // Watch within the windowManager dir for changes, and reload if changes are detected
            // hmr({
            //     onChange: () => {
            //         console.log("changes");
            //         console.log(__dirname);
            //         this.window.loadURL(indexPath);
            //         this.window.webContents.openDevTools();
            //     },
            //     watchDir: __dirname,
            // });
            this.window.loadURL(indexPath);
            this.window.webContents.openDevTools({mode: "detach"});
        } else {
            this.window.loadURL(indexPath);
        }
    }

    /**
     * Destroy the window manager and the window(s) it is managing
     */
    public destroy(): void {
        this.window.destroy();
    }
}
