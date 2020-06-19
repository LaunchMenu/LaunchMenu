import {app, BrowserWindow} from "electron";
import page from "./index.html";

const mode = process.env.NODE_ENV;
function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // and load the index.html of the app.
    if (mode == "development") {
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
    } else {
        win.loadFile(page);
    }
}

app.whenReady().then(createWindow);
