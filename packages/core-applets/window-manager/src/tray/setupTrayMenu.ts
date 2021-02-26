import {LaunchMenu} from "@launchmenu/core";
import {nativeImage, remote, Tray, shell} from "electron";
import {IDataHook, Observer} from "model-react";
import Path from "path";
import {settings} from "../settings";

/**
 * Sets up the tray menu
 * @param LM The LaunchMenu instance to control
 * @returns A function that can be used to destroy the tray menu
 */
export function setupTrayMenu(LM: LaunchMenu): () => void {
    const showWindow = () => LM.setWindowOpen(true);
    const getAutomaticStartupField = (hook?: IDataHook) =>
        LM.getSettingsManager().getSettingsContext(hook).get(settings).automaticStartup;

    // Setup the tray icon
    let tray: Tray | undefined;
    let startupObserver: Observer<any> | undefined;
    try {
        tray = new remote.Tray(nativeImage.createEmpty());
        tray.setImage(
            nativeImage.createFromPath(
                Path.join(__dirname, "..", "..", "images", "trayIcon.png")
            )
        );

        tray.setTitle("LaunchMenu");
        tray.setToolTip("LaunchMenu");
        tray.on("click", showWindow);

        // Setup the context menu
        const contextMenu = remote.Menu.buildFromTemplate([
            {
                label: "About",
                type: "normal",
                click: () => openLink("https://launchmenu.github.io/"),
            },
            {
                label: "Automatic startup",
                type: "checkbox",
                click: () => {
                    const field = getAutomaticStartupField();
                    field.set(!field.get());
                },
            },
            {label: "Restart", type: "normal", click: () => LM.restart()},
            {label: "Quit", type: "normal", click: () => LM.shutdown()},
        ]);
        tray.setContextMenu(contextMenu);

        // Synchronize the automatic startup checkbox
        startupObserver = new Observer(h => getAutomaticStartupField(h).get(h)).listen(
            autoStartup => {
                contextMenu.items[1].checked = autoStartup;
            },
            true
        );
    } catch (e) {
        console.error(e);
    }

    return () => {
        tray?.destroy();
        startupObserver?.destroy();
    };
}

/**
 * Opens the specified link in the user's browser
 * @param url The url to be opened
 */
function openLink(url: string): void {
    shell.openExternal(url).catch(e => console.error(e));
}
