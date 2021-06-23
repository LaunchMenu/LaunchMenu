import {app, ipcMain} from "electron";
import {WindowController} from "./WindowController";
import hmr from "@launchmenu/hmr";
import {IApplicationConfig} from "./_types/IApplicationConfig";

global.DEV = process.env.NODE_ENV == "dev";

/**
 * Launches the application
 * @param config Configuration for LM to be used
 * @returns A function that can be called to show LM
 */
export async function launch(config: IApplicationConfig): Promise<{
    /** A function to force open the window */
    show: () => void;
    /** A promise that resolves once the window has been opened in some way */
    shown: Promise<void>;
    /** Used to fully exit LM */
    exit: () => void;
}> {
    ipcMain.on("log", (event, ...args) => console.log(...args));

    let allowQuit = false;
    app.on("will-quit", event => {
        if (!allowQuit) event.preventDefault();
    });

    await app.whenReady();

    // Start the initial LM instance
    let windowController = new WindowController(config);

    let restartPromise = Promise.resolve();
    let lastUpdate: number | undefined;
    /** A function to restart LaunchMenu */
    const restart = async () => {
        const updateTime = Date.now();
        lastUpdate = updateTime;
        restartPromise = restartPromise.then(async () => {
            // Make sure this is the last requested update
            if (lastUpdate != updateTime) return;

            // Dispose the old window
            await windowController.destroy();

            // Get a fresh instance of the class and reinitialize the window
            const {
                WindowController,
            }: typeof import("./WindowController") = require("./WindowController");
            windowController = new WindowController(config);
        });
    };

    // Take care of restarting and shutting down
    ipcMain.on("restart", restart);
    let quit = false;
    ipcMain.on("shutdown", async () => {
        if (quit) return;
        quit = true;
        await windowController.destroy();
        allowQuit = true;
        app.quit();
    });

    // If in development enable HMR for the window
    if (DEV) {
        // Watch within the windowManager dir for changes, and reload if changes are detected
        hmr(__dirname, restart);
    }

    // Resolve the promise once LM has fully started
    await windowController.started;
    return {
        show: () => windowController.show(),
        shown: windowController.shown,
        exit: () => ipcMain.emit("shutdown"),
    };
}
