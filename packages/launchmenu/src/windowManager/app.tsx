import ReactDOM from "react-dom";
import Path from "path";
import hmr from "@launchmenu/hmr";

export function startApplication() {
    global.DEV = process.env.NODE_ENV == "dev";

    let lm: import("../application/LaunchMenu").LaunchMenu;
    async function startup() {
        const {
            LaunchMenu,
        }: typeof import("../application/LaunchMenu") = require("../application/LaunchMenu");

        (window as any).launchmenu = lm = new LaunchMenu();
        await lm.setup();
        ReactDOM.render(lm.view, document.getElementById("root"));
    }
    startup();

    if (DEV) {
        // Reload the contents whenever something changes
        hmr(Path.join(__dirname, ".."), (changed, affected) => {
            try {
                if (lm) lm.destroy();
            } catch (e) {
                console.log(
                    "%cFailed to dispose of previous LM instance:",
                    "color: red;"
                );
                console.error(e);
            }
            console.log("%cApplication has been reloaded", "color: blue;");
            startup();
        });
    }
}
try {
    (window as any).startApplication = startApplication;
} catch (e) {}
