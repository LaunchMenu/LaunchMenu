import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";

/**
 * Creates a new settings folder with shortcut settings
 * @returns The created shortcuts folder
 */
export function createShortcutSettingsFolder() {
    return createSettingsFolder({
        name: "Shortcuts",
        children: {
            copy: createKeyPatternSetting({
                name: "Copy",
                init: new KeyPattern("ctrl+c"),
            }),
            copySecondary: createKeyPatternSetting({
                name: "Copy secondary",
                init: new KeyPattern("ctrl+shift+c"),
            }),
            paste: createKeyPatternSetting({
                name: "Paste",
                init: new KeyPattern("ctrl+v"),
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
    });
}
