import {app} from "electron";
import {WindowManager} from "./windowManager/WindowManager";
import Path from "path";
import hmr from "@launchmenu/hmr";

global.DEV = process.env.NODE_ENV == "dev";

app.whenReady().then(() => {
    let windowManager = new WindowManager();
    if (DEV) {
        // Watch within the windowManager dir for changes, and reload if changes are detected
        hmr(Path.join(__dirname, "windowManager"), () => {
            // Get a fresh instance of the class
            const WindowManager: {
                new (): WindowManager;
            } = require("./windowManager/WindowManager").WindowManager;

            // Reinitialize the window
            let newManager = new WindowManager();
            windowManager.destroy();
            windowManager = newManager;
        });
    } else {
        new WindowManager();
    }
});
