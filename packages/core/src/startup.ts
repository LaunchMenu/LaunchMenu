import {app} from "electron";
import {launch} from "./windowManager/launcher";

// Only run this code if we are in the main electron process
if (app) {
    launch();
}
