import {app} from "electron";
import {WindowManager} from "./windowManager/WindowManager";
import Path from "path";
import hmr from "@launchmenu/hmr";

// Only run this code if we are in the main electron process
if (app) {
    global.DEV = process.env.NODE_ENV == "dev";
    // app.allowRendererProcessReuse = false;

    app.whenReady().then(() => {
        let windowManager = new WindowManager();
        if (DEV) {
            // Watch within the windowManager dir for changes, and reload if changes are detected
            hmr(
                Path.join(__dirname, "windowManager"),
                () => {
                    // Get a fresh instance of the class
                    const {
                        WindowManager,
                    }: typeof import("./windowManager/WindowManager") = require("./windowManager/WindowManager");

                    // Reinitialize the window
                    let newManager = new WindowManager();
                    windowManager.destroy();
                    windowManager = newManager;
                },
                {target: require.resolve("./windowManager/WindowManager")}
            );
        } else {
            new WindowManager();
        }
    });
}
