import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";

/**
 * Extracts whether the given data is a field controls settings folder
 * @param folder The data to check
 * @returns Whether the given data is a folder
 */
export function isFieldControlsSettingsFolder(
    folder: any
): folder is TSettingsFromFactory<typeof createFieldControlsSettingsFolder> {
    return "end" in folder && "get" in folder.end;
}
