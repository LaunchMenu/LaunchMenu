import {Observer, SettingsManager} from "@launchmenu/core";
import {settings} from "../settings";
import {IStartupController} from "./_types/IStartupController";
import Path from "path";

const testing = false;

/**
 * Sets up the startup controller that syncs with the setting
 * @param settingsManager The settings manager to get the setting from
 */
export function setupStartupController(settingsManager: SettingsManager): () => void {
    const installer = startupControllers[process.platform]?.();

    const exePath = Path.join(process.cwd(), "LaunchMenu.exe");
    let changingPromise = Promise.resolve();

    const observer = new Observer(h =>
        settingsManager.getSettingsContext(h).get(settings).automaticStartup.get(h)
    ).listen(async automaticStartup => {
        changingPromise = changingPromise.then(async () => {
            if (
                // TODO: get dev from a LM property
                (!(global as any).DEV || testing) &&
                installer &&
                (await installer.isRegistered(exePath)) != automaticStartup
            ) {
                if (automaticStartup) await installer.register(exePath);
                else await installer.deregister(exePath);
            }
        });
    }, true);

    return () => observer.destroy();
}

const startupControllers = ({
    win32: () => require("./OScontrollers/windowsStartup").default,
} as any) as {[key: string]: (() => IStartupController) | undefined};
