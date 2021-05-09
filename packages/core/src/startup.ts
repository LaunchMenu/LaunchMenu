import {app} from "electron";
import {launch} from "./windowController/launcher";

app.commandLine.appendSwitch("ignore-certificate-errors", "true"); // https://github.com/electron/electron/issues/25354#issuecomment-739804891

// Only run this code if we are in the main electron process
if (app) {
    launch().then(({exit}) => {
        process.on("exit", code => {
            exit();
        });
    });
}
