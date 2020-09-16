import {app, BrowserWindow} from "electron";
import Path from "path";

const mode = process.env.NODE_ENV;
function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 700,
        height: 450,
        // frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    win.on("blur", () => win.webContents.send("blur"));

    // and load the index.html of the app.
    if (mode == "dev") {
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
    } else {
        win.loadURL(Path.join(__dirname, "index.html"));
    }
}

app.whenReady().then(createWindow);
