import {IStartupController} from "../_types/IStartupController";
import {remote} from "electron";
import AutoLaunch from "auto-launch";
import {constGetter} from "@launchmenu/core";

const autoLauncher = constGetter(
    () =>
        new AutoLaunch({
            path: remote.process.execPath,
            name: "LaunchMenu",
            mac: {
                useLaunchAgent: true, //TODO: After we have signing working for Mac OS X distro then switch this value to false.
            },
        })
);

const macStartup: IStartupController = {
    register: () => autoLauncher().enable(),
    deregister: () => autoLauncher().disable(),
    isRegistered: () => autoLauncher().isEnabled(),
};
export default macStartup;
