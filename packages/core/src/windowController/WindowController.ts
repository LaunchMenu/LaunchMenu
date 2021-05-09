import {BrowserWindow, shell} from "electron";
import Path from "path";
import {standardWindowSize} from "./standardWindowSize";

export class WindowController {
    protected window: BrowserWindow;

    /**
     * A promise that resolves once the window has been opened at least once
     */
    public shown: Promise<void>;

    /**
     * Creates a new window manager
     * @param shortcutManager The shortcut manager to manage the global shortcuts
     */
    public constructor() {
        // Create the browser window
        this.window = new BrowserWindow({
            ...standardWindowSize,
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
        this.window.menuBarVisible = false;

        // Load the index.html of the app
        const indexPath = Path.join(__dirname, "index.html");
        this.window.loadURL(indexPath);

        // Handle links
        const webview = this.window.webContents;
        function openLink(url: string) {
            shell.openExternal(url).catch(e => console.error(e));
        }
        webview.on("new-window", (event, url) => {
            event.preventDefault();
            openLink(url);
        });
        webview.on("will-navigate", (e, url) => {
            webview.stop();
            openLink(url);
        });

        // TODO: I forgot to document why I added this... Look into this again and add relevant comment
        webview.session.webRequest.onHeadersReceived({urls: ["*://*/*"]}, (d: any, c) => {
            if (d.responseHeaders["X-Frame-Options"]) {
                delete d.responseHeaders["X-Frame-Options"];
            } else if (d.responseHeaders["x-frame-options"]) {
                delete d.responseHeaders["x-frame-options"];
            }

            c({cancel: false, responseHeaders: d.responseHeaders});
        });

        // Track whether the window has been shown. To be used by the installer
        this.shown = new Promise(res => {
            this.window.on("show", () => res());
        });
    }

    /**
     * Shows the LM window
     */
    public show(): void {
        this.window.show();
    }

    /**
     * Destroy the window manager and the window(s) it is managing
     */
    public async destroy(): Promise<void> {
        // Listen for the window to finish disposing
        const disposePromise = new Promise<void>(res => {
            this.window.webContents.on("ipc-message", (event, message) => {
                if (message == "LM-disposed") return res();
            });
            setTimeout(res, 10000);
        });

        // Send a command to the window to dispose everything
        this.window.webContents.send("LM-dispose");
        await disposePromise;

        this.window.destroy();
    }
}
