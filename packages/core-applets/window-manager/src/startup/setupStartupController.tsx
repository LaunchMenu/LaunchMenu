import {SettingsManager} from "@launchmenu/core";
import {settings} from "../settings";
import {IDataHook, Observer} from "model-react";
import {IStartupController} from "./_types/IStartupController";

const testing = false;

/**
 * Sets up the startup controller that syncs with the setting
 * @param settingsManager The settings manager to get the setting from
 * @param isInDevMode Whether the application is in dev mode
 */
export function setupStartupController(
    settingsManager: SettingsManager,
    isInDevMode: (h?: IDataHook) => boolean = () => false
): () => void {
    const installer = startupControllers[process.platform]?.();

    let changingPromise = Promise.resolve();
    const observer = new Observer(h => ({
        automaticStartup: settingsManager
            .getSettingsContext(h)
            .get(settings)
            .automaticStartup.get(h),
        devMode: isInDevMode(h),
    })).listen(async ({automaticStartup, devMode}) => {
        changingPromise = changingPromise.then(async () => {
            if (
                // TODO: get dev from a LM property
                (!devMode || testing) &&
                installer &&
                (await installer.isRegistered()) != automaticStartup
            ) {
                if (automaticStartup) await installer.register();
                else await installer.deregister();
            }
        });
    }, true);

    return () => observer.destroy();
}

const startupControllers = {
    win32: () => require("./OScontrollers/windowsStartup").default,
    darwin: () => require("./OScontrollers/macStartup").default,
} as any as {[key: string]: (() => IStartupController) | undefined};
