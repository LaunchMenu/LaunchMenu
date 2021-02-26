import React from "react";
import {createBooleanSetting} from "../../../settings/inputs/createBooleanSetting";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../utils/constGetter";
import {createCommonControlsSettingsFolder} from "./controls/createCommonControlsSettingsFolder";
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
            advancedUsage: createBooleanSetting({
                name: "Advanced usage",
                content: (
                    <>
                        Whether to reveal additional options around LM, which are less
                        intuitive to use but could be useful.
                    </>
                ),
                init: false,
            }),
            controls: createSettingsFolder({
                name: "Controls",
                children: {
                    menu: createMenuControlsSettingsFolder(),
                    field: createFieldControlsSettingsFolder(),
                    content: createContentControlsSettingsFolder(),
                    common: createCommonControlsSettingsFolder(),
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

/** The modifier to make the arrow keys act for menu navigation instead of text navigation */
export const menuNavigationModifier = process.platform == "darwin" ? "ctrl" : "alt";
