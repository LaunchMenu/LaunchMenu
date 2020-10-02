import {createMenuControlsSettingsFolder} from "../../../../application/settings/baseSettings/controls/createMenuControlsSettingsFolder";
import {TSettingsFromFactory} from "../../../../settings/_types/TSettingsFromFactory";

/**
 * Extracts whether the given data is a menu controls settings folder
 * @param folder The data to check
 * @returns Whether the given data is a folder
 */
export function isMenuControlsSettingsFolder(
    folder: any
): folder is TSettingsFromFactory<typeof createMenuControlsSettingsFolder> {
    return "up" in folder && "get" in folder.up;
}
