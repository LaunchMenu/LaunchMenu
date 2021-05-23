import {SettingsManager} from "@launchmenu/core";
import {settings} from "../settings";
import {IDataHook, Observer} from "model-react";
import AutoLaunch from "auto-launch";
import {remote} from "electron";

/**
 * Sets up the startup controller that syncs with the setting
 * @param settingsManager The settings manager to get the setting from
 * @param isInDevMode Whether the application is in dev mode
 */
export function setupStartupController(
    settingsManager: SettingsManager,
    isInDevMode: (h?: IDataHook) => boolean = () => false
): () => void {
    let changingPromise = Promise.resolve();
    const autoLauncher = new AutoLaunch({
        path: remote.process.execPath,
        name: "LaunchMenu",
        mac: {
            useLaunchAgent: true, //TODO: After we have signing working for Mac OS X distro then switch this value to false.
        },
    });

    const observer = new Observer(h => ({
        automaticStartup: settingsManager
            .getSettingsContext(h)
            .get(settings)
            .automaticStartup.get(h),
        devMode: isInDevMode(h),
    })).listen(async ({automaticStartup, devMode}) => {
        changingPromise = changingPromise.then(async () => {
            if (!devMode) {
                const valueChanged = (await autoLauncher.isEnabled()) != automaticStartup;
                if (valueChanged) {
                    if (automaticStartup) await autoLauncher.enable();
                    else await autoLauncher.disable();
                }
            }
        });
    }, true);

    return () => observer.destroy();
}
