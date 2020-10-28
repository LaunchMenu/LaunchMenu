import {app} from "electron";
import {WindowManager} from "./WindowManager";
import hmr from "@launchmenu/hmr";

global.DEV = process.env.NODE_ENV == "dev";

/**
 * Launches the application
 */
export function launch() {
    // app.allowRendererProcessReuse = false;
    app.whenReady().then(() => {
        let windowManager = new WindowManager();
        if (DEV) {
            // Watch within the windowManager dir for changes, and reload if changes are detected
            hmr(
                __dirname,
                () => {
                    // Get a fresh instance of the class
                    const {
                        WindowManager,
                    }: typeof import("./WindowManager") = require("./WindowManager");

                    // Reinitialize the window
                    let newManager = new WindowManager();
                    windowManager.destroy();
                    windowManager = newManager;
                },
                {target: require.resolve("./WindowManager")}
            );
        }
    });
}
