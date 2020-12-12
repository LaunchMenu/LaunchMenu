import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {createSettings} from "../../../settings/createSettings";
import {createKeyPatternSetting} from "../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../utils/constGetter";
import {createContentControlsSettingsFolder} from "./controls/createContentControlsSettingsFolder";
import {
    createFieldControlsSettingsFolder,
    fieldControlsFolderCategories,
} from "./controls/createFieldControlsSettingsFolder";
import {createMenuControlsSettingsFolder} from "./controls/createMenuControlsSettingsFolder";
import {createSearchSettingsFolder} from "./createSearchSettingsFolder";

/**
 * Categories in the base settings
 */
export const settingsCategories = constGetter(() => ({
    field: fieldControlsFolderCategories(),
}));

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
                        content: createContentControlsSettingsFolder(),
                        back: createKeyPatternSetting({
                            name: "Back",
                            init: new KeyPattern("esc"),
                        }),
                        search: createSettingsFolder({
                            name: "Search",
                            children: {
                                openAtTrace: createKeyPatternSetting({
                                    name: "Open in location",
                                    init: new KeyPattern("ctrl+o"),
                                }),
                            },
                        }),
                    },
                }),
                search: createSearchSettingsFolder(),
            },
        }),
});
