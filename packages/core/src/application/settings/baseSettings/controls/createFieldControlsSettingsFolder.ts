import {createStandardCategory} from "../../../../menus/categories/createStandardCategory";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../../utils/constGetter";

/**
 * The categories used for the field folder
 */
export const fieldControlsFolderCategories = constGetter(() => ({
    jumps: createStandardCategory({name: "Cursor jumps"}),
    clipboard: createStandardCategory({name: "Clipboard interaction"}),
    textNavigation: createStandardCategory({name: "Text navigation"}),
    insertDelete: createStandardCategory({name: "Text insertion and deletion"}),
}));

/**
 * Creates a new settings folder with field settings
 * @returns The created field controls folder
 */
export function createFieldControlsSettingsFolder() {
    return createSettingsFolder({
        name: "Field",
        children: {
            // clipboard
            copy: createKeyPatternSetting({
                name: "Copy text",
                init: new KeyPattern("ctrl+c"),
                category: fieldControlsFolderCategories().clipboard,
            }),
            paste: createKeyPatternSetting({
                name: "Paste text",
                init: new KeyPattern("ctrl+v"),
                category: fieldControlsFolderCategories().clipboard,
            }),
            cut: createKeyPatternSetting({
                name: "Cut text",
                init: new KeyPattern("ctrl+x"),
                category: fieldControlsFolderCategories().clipboard,
            }),

            // Jumps
            home: createKeyPatternSetting({
                name: "Jump to the start of the input",
                init: new KeyPattern([
                    {pattern: "home", type: "down", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().jumps,
            }),
            end: createKeyPatternSetting({
                name: "Jump to the end of the input",
                init: new KeyPattern([
                    {pattern: "end", type: "down", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().jumps,
            }),
            selectAll: createKeyPatternSetting({
                name: "Select all of the text",
                init: new KeyPattern("ctrl+a"),
                category: fieldControlsFolderCategories().jumps,
            }),

            // Text navigation
            left: createKeyPatternSetting({
                name: "Move to the left",
                init: new KeyPattern([
                    {pattern: ["left"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().textNavigation,
            }),
            right: createKeyPatternSetting({
                name: "Move to the right",
                init: new KeyPattern([
                    {pattern: ["right"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().textNavigation,
            }),
            up: createKeyPatternSetting({
                name: "Move the cursor a line up",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["up"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().textNavigation,
            }),
            down: createKeyPatternSetting({
                name: "Move the cursor a line down",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["down"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().textNavigation,
            }),
            expandSelection: createKeyPatternSetting({
                name: "Expand selection",
                description: "Only pattern is used", // TODO: create a class + UI for modifier patterns
                init: new KeyPattern("shift"),
                category: fieldControlsFolderCategories().textNavigation,
            }),

            // Text insertion and deletion
            backspace: createKeyPatternSetting({
                name: "Remove the character before the cursor",
                init: new KeyPattern([
                    {
                        pattern: ["backspace"],
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: fieldControlsFolderCategories().insertDelete,
            }),
            delete: createKeyPatternSetting({
                name: "Remove the character behind the cursor",
                init: new KeyPattern([
                    {pattern: ["delete"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().insertDelete,
            }),
            insertLine: createKeyPatternSetting({
                name: "Insert a new line",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["enter"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: fieldControlsFolderCategories().insertDelete,
            }),
        },
    });
}
