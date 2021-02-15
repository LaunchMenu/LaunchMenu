import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {menuNavigationModifier} from "../createBaseSettingsFolder";

/**
 * Creates a new settings folder with common (shared between sections) control settings
 * @returns The created settings folder
 */
export function createCommonControlsSettingsFolder() {
    return createSettingsFolder({
        name: "Common controls",
        children: {
            back: createKeyPatternSetting({
                name: "Back",
                init: new KeyPattern([
                    {pattern: "esc", type: "down"},
                    {pattern: `${menuNavigationModifier}+left`, type: "down"},
                ]),
            }),
        },
    });
}
