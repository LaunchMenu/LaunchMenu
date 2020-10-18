import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {createSettings} from "../../../settings/createSettings";
import {createKeyPatternSetting} from "../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";
import {
    createFieldControlsSettingsFolder,
    fieldControlsFolderCategories,
} from "./controls/createFieldControlsSettingsFolder";
import {createMenuControlsSettingsFolder} from "./controls/createMenuControlsSettingsFolder";

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
                        menu: createMenuControlsSettingsFolder(),
                        field: createFieldControlsSettingsFolder(),
                        back: createKeyPatternSetting({
                            name: "back",
                            init: new KeyPattern("esc"),
                        }),
                    },
                }),
            },
        }),
});
