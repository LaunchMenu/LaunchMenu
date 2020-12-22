import {IStartupController} from "../_types/IStartupController";
import Path from "path";
import FS from "fs";
import {promisify} from "util";
import ws from "windows-shortcuts";

const startupFolder =
    "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp";
function getTargetPath(inputLocation: string): string {
    const fileName = Path.basename(inputLocation);
    const shortcutName = fileName.replace(/\.[^.]*$/, ".lnk");
    return Path.join(startupFolder, shortcutName);
}

export const windowStartup: IStartupController = {
    register: async location => {
        return new Promise((res, rej) => {
            ws.create(
                getTargetPath(location),
                {target: location, workingDir: Path.dirname(location)},
                error => {
                    if (error) rej(error);
                    else res();
                }
            );
        });
    },
    deregister: async location => promisify(FS.unlink)(getTargetPath(location)),
    isRegistered: async location => FS.existsSync(getTargetPath(location)),
};
