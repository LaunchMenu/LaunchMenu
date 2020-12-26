import {IStartupController} from "../_types/IStartupController";
import regedit from "./regedit";

const loc = "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
const key = "LaunchMenu";
const windowStartup: IStartupController = {
    register: async location =>
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
    deregister: async location =>
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
    isRegistered: async location =>
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
