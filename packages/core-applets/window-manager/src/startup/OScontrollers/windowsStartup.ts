import {IStartupController} from "../_types/IStartupController";
import Path from "path";
import FS from "fs";
import {promisify} from "util";

const startupFolder =
    "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp";
function getTargetPath(inputLocation: string): string {
    const fileName = Path.basename(inputLocation);
    return Path.join(startupFolder, fileName);
}

export const windowStartup: IStartupController = {
    register: async location => promisify(FS.copyFile)(location, getTargetPath(location)),
    deregister: async location => promisify(FS.unlink)(getTargetPath(location)),
    isRegistered: async location => FS.existsSync(getTargetPath(location)),
};
