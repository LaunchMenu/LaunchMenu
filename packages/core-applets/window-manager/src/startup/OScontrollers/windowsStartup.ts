import {IStartupController} from "../_types/IStartupController";
import regedit from "./regedit";
// We're not using `auto-launch` here since the registry location they use doesn't appear to work for us  (potentially due to elevation)

// Reference for future improvement: https://stackoverflow.com/questions/5427673/how-to-run-a-program-automatically-as-admin-on-windows-7-at-startup
// Reference current solution: https://stackoverflow.com/a/10201281/8521718
const loc = "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run";
const key = "LaunchMenu";
const windowStartup: IStartupController = {
    register: location =>
        new Promise((res, rej) => {
            regedit.putValue(
                {
                    [loc]: {
                        [key]: {
                            type: "REG_SZ",
                            value: location,
                        },
                    },
                },
                error => {
                    if (error) rej(error);
                    else res();
                }
            );
        }),
    deregister: location =>
        new Promise((res, rej) => {
            regedit.putValue(
                {
                    [loc]: {
                        [key]: {
                            type: "REG_SZ",
                            value: "",
                        },
                    },
                },
                error => {
                    if (error) rej(error);
                    else res();
                }
            );
        }),
    isRegistered: location =>
        new Promise((res, rej) => {
            regedit.list([loc], (error, value) => {
                if (error) rej(error);
                else {
                    const entry = value[loc].values[key];
                    res(entry?.value == location);
                }
            });
        }),
};
export default windowStartup;
