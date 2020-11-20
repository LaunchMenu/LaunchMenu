import {createContentControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createContentControlsSettingsFolder";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";

/**
 * Extracts whether the given data is a content controls settings folder
 * @param folder The data to check
 * @returns Whether the given data is a folder
 */
export function isContentControlsSettingsFolder(
    folder: any
): folder is TSettingsFromFactory<typeof createContentControlsSettingsFolder> {
    return "contentUp" in folder && "get" in folder.contentUp;
}
