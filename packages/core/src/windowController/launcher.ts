import {app, ipcMain} from "electron";
import {WindowController} from "./WindowController";
import hmr from "@launchmenu/hmr";

global.DEV = process.env.NODE_ENV == "dev";

/**
 * Launches the application
 */
export function launch() {
    let allowQuit = false;
    app.on("will-quit", event => {
        if (!allowQuit) event.preventDefault();
    });

    // app.allowRendererProcessReuse = false;
    app.whenReady().then(() => {
        let windowController = new WindowController();

        /** A function to restart LaunchMenu */
        let restartPromise = Promise.resolve();
        let lastUpdate: number | undefined;
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
                windowController = new WindowController();
            });
        };

        ipcMain.on("restart", restart);
        ipcMain.on("shutdown", async () => {
            await windowController.destroy();
            allowQuit = true;
            app.quit();
        });

        if (DEV) {
            // Watch within the windowManager dir for changes, and reload if changes are detected
            hmr(__dirname, restart, {target: require.resolve("./WindowController")});
        }
    });
}
