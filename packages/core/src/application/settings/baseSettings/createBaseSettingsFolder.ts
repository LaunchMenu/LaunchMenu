import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../utils/constGetter";
import {createContentControlsSettingsFolder} from "./controls/createContentControlsSettingsFolder";
import {
    createFieldControlsSettingsFolder,
    getFieldControlsFolderCategories,
} from "./controls/createFieldControlsSettingsFolder";
import {createMenuControlsSettingsFolder} from "./controls/createMenuControlsSettingsFolder";
import {createShortcutSettingsFolder} from "./controls/createShorcutSettingsFolder";
import {createContentSettingsFolder} from "./general/content/createContentSettingsFolder";
import {createFieldSettingsFolder} from "./general/createFieldSettingsFolder";
import {createMenuSettingsFolder} from "./general/createMenuSettingsFolder";
import {createSearchSettingsFolder} from "./general/createSearchSettingsFolder";

/**
 * Categories in the base settings
 */
export const settingsCategories = constGetter(() => ({
    field: getFieldControlsFolderCategories(),
}));

/**
 * Creates the base settings for the application
 * @returns A new base settings folder
 */
export function createBaseSettingsFolder() {
    return createSettingsFolder({
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
                    shortcuts: createShortcutSettingsFolder(),
                },
            }),
            search: createSearchSettingsFolder(),
            menu: createMenuSettingsFolder(),
            field: createFieldSettingsFolder(),
            content: createContentSettingsFolder(),
        },
    });
}
