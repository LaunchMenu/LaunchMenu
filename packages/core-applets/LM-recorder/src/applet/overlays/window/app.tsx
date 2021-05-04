import React from "react";
import ReactDOM from "react-dom";

/**
 * Starts the application in the created window
 */
export function startApplication() {
    global.DEV = process.env.NODE_ENV == "dev";

    // Despite not needing LM ourselves, we need to import it directly in case any component make use of anything within LM
    // Due to all sorts of dependency cycles that will be a lot of effort to fix, we need to first force load the LM class
    require("@launchmenu/core/build/application/LaunchMenu");

    const {OverlayManager} = require("./OverlayManager");
    ReactDOM.render(<OverlayManager />, document.getElementById("root"));
}

try {
    (window as any).startApplication = startApplication;
} catch (e) {}
