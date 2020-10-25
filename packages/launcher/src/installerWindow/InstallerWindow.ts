import {BrowserWindow, ipcMain} from "electron";
import Path from "path";

type State = {type: "loading" | "configuring"; name: string};

export class InstallerWindow {
    protected window: BrowserWindow;

    /**
     * Creates a new installer window, which can be used to visualize the current installation step.
     */
    public constructor() {}

    /**
     * Initializes the window
     */
    public init(): Promise<void> {
        return new Promise(res => {
            ipcMain.once("ready", () => {
                this.window.show();
                res();
            });

            this.window = new BrowserWindow({
                title: "LM setup",
                width: 400,
                height: 400,
                frame: false,
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                },
            });

            this.window.loadFile(Path.join(__dirname, "index.html"));
            // this.window.webContents.openDevTools();
        });
    }

    /**
     * Retrieves the initial applets to be installed, by asking the user for it
     * @returns The selected applets to install
     */
    public async getInitialApplets(): Promise<string[]> {
        this.setState({type: "configuring", name: "applets"});
        return new Promise((res, rej) => {
            ipcMain.once("selectApplets", (event, applets: string[]) => {
                res(applets);
            });
        });
    }

    /**
     * Sets the state to be displayed in the window
     * @param state The state to be displayed
     */
    public async setState(state: State): Promise<void> {
        this.window.webContents.send("state", state);
    }

    /**
     * Closes the window
     */
    public close(): void {
        this.window.close();
    }
}
