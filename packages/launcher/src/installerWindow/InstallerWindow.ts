import {BrowserWindow, ipcMain} from "electron";
import Path from "path";
import {IState} from "../_types/IState";
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
                height: 250,
                frame: false,
                show: false,
                resizable: false,
                webPreferences: {
                    nodeIntegration: true,
                },
                icon: Path.join(__dirname, "..", "icon.png"),
            });

            this.window.loadFile(Path.join(__dirname, "index.html"));
            if (DEV) this.window.webContents.openDevTools();
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
     * @returns The selected value if a prompt state was specified
     */
    public async setState<T>(state: IState<T>): Promise<T> {
        this.window.webContents.send("state", state);
        if (state.type == "prompt") {
            return new Promise(res => {
                ipcMain.once("clickButton", (event, index: number) => {
                    res(state.buttons[index].value);
                });
            });
        }
        return Promise.resolve() as any as Promise<T>;
    }

    /**
     * Closes the window
     */
    public close(): void {
        this.window.close();
    }
}
