import ReactDOM from "react-dom";
import Path from "path";
import hmr from "@launchmenu/hmr";
import {ipcRenderer} from "electron";
import {IApplicationConfig} from "./_types/IApplicationConfig";

export async function startApplication() {
    // Retrieve the application config
    ipcRenderer.send("LM-requestConfig");
    const config = await new Promise<IApplicationConfig>(res => {
        ipcRenderer.once("LM-sendConfig", (event, config: IApplicationConfig) => {
            res(config);
        });
    });

    // Globally inject a DEV variable indicating whether running in production or development mode
    global.DEV = process.env.NODE_ENV == "dev";

    // Prevent accidental global close usage
    global.close = () =>
        console.log(
            "LM shouldn't be closed this way, did you call global close on accident?"
        );

    let lm: import("../application/LaunchMenu").LaunchMenu;
    async function startup() {
        const {
            LaunchMenu,
        }: typeof import("../application/LaunchMenu") = require("../application/LaunchMenu");

        (window as any).launchmenu = lm = new LaunchMenu(config);
        lm.setDevMode(global.DEV);
        await lm.setup();
        ReactDOM.render(lm.view, document.getElementById("root"));
    }
    let prevStartup = startup();

    // Listen for dispose requests, to properly dispose of all data
    ipcRenderer.on("LM-dispose", async () => {
        await prevStartup;
        await lm.destroy();
        ipcRenderer.send("LM-disposed");
    });

    if (DEV) {
        // Reload the contents whenever something changes
        // TODO: add some 'except path' to hmr, to ignore any changes to the api and types
        hmr(Path.join(__dirname, ".."), (changed, affected) => {
            const p = prevStartup;
            prevStartup = (async () => {
                try {
                    await p;
                } catch (e) {}
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
                await startup();
            })();
        });
    }
}
try {
    (window as any).startApplication = startApplication;
} catch (e) {}
