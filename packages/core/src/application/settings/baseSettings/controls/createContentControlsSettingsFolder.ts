import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";

/**
 * Creates a new settings folder with content settings
 * @returns The created content controls folder
 */
export function createContentControlsSettingsFolder() {
    return createSettingsFolder({
        name: "Content",
        children: {
            contentUp: createKeyPatternSetting({
                name: "Scroll content up",
                init: new KeyPattern([{type: "down or repeat", pattern: "pageUp"}]),
            }),
            contentDown: createKeyPatternSetting({
                name: "Scroll content down",
                init: new KeyPattern([{type: "down or repeat", pattern: "pageDown"}]),
            }),
        },
    });
}
