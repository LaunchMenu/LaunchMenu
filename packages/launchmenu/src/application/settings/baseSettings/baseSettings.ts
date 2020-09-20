import {createSettings} from "../../../settings/createSettings";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";
import {
    createFieldControlsSettingsFolder,
    fieldControlsFolderCategories,
} from "./controls/fieldControlsSettingsFolder";

/**
 * Categories in the base settings
 */
export const settingsCategories = {
    field: fieldControlsFolderCategories,
};

/**
 * The base settings for the application
 */
export const baseSettings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            name: "Base settings",
            children: {
                controls: createSettingsFolder({
                    name: "Controls",
                    children: {
                        field: createFieldControlsSettingsFolder(),
                    },
                }),
            },
        }),
});
