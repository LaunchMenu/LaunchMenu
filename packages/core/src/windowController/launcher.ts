import {app} from "electron";
import {WindowController} from "./WindowController";
import hmr from "@launchmenu/hmr";

global.DEV = process.env.NODE_ENV == "dev";

/**
 * Launches the application
 */
export function launch() {
    // app.allowRendererProcessReuse = false;
    app.whenReady().then(() => {
        let windowController = new WindowController();
        if (DEV) {
            // Watch within the windowManager dir for changes, and reload if changes are detected
            hmr(
                __dirname,
                () => {
                    // Get a fresh instance of the class
                    const {
                        WindowController,
                    }: typeof import("./WindowController") = require("./WindowController");

                    // Reinitialize the window
                    let newController = new WindowController();
                    windowController.destroy();
                    windowController = newController;
                },
                {target: require.resolve("./WindowController")}
            );
        }
    });
}