import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {menuNavigationModifier} from "../createBaseSettingsFolder";

/**
 * Creates a new settings folder with field settings
 * @returns The created field controls folder
 */
export function createMenuControlsSettingsFolder() {
    return createSettingsFolder({
        name: "Menu controls",
        children: {
            execute: createKeyPatternSetting({
                name: "Execute item",
                init: new KeyPattern([
                    {pattern: "enter", type: "down"},
                    {pattern: `${menuNavigationModifier}+right`, type: "down"},
                ]),
            }),
            up: createKeyPatternSetting({
                name: "Move cursor up",
                init: new KeyPattern([
                    {pattern: "up", type: "down or repeat", allowExtra: ["shift"]},
                    {
                        pattern: `${menuNavigationModifier}+up`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
            }),
            down: createKeyPatternSetting({
                name: "Move cursor down",
                init: new KeyPattern([
                    {pattern: "down", type: "down or repeat", allowExtra: ["shift"]},
                    {
                        pattern: `${menuNavigationModifier}+down`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
            }),
            selectItem: createKeyPatternSetting({
                name: "Select item",
                init: new KeyPattern("shift"),
            }),
            openContextMenu: createKeyPatternSetting({
                name: "Open context menu",
                init: new KeyPattern("tab"),
            }),
        },
    });
}
