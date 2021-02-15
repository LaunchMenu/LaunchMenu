import {createStandardCategory} from "../../../../menus/categories/createStandardCategory";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../../utils/constGetter";

/**
 * The categories used for the field folder
 */
export const getFieldControlsFolderCategories = constGetter(() => ({
    jumps: createStandardCategory({name: "Cursor jumps"}),
    clipboard: createStandardCategory({name: "Clipboard interaction"}),
    textNavigation: createStandardCategory({name: "Text navigation"}),
    insertDelete: createStandardCategory({name: "Text insertion and deletion"}),
    meta: createStandardCategory({name: "Meta controls"}),
}));

/**
 * Creates a new settings folder with field controls settings
 * @returns The created field controls folder
 */
export function createFieldControlsSettingsFolder() {
    return createSettingsFolder({
        name: "Field controls",
        children: {
            // clipboard
            copy: createKeyPatternSetting({
                name: "Copy text",
                init: new KeyPattern("ctrl+c"),
                category: getFieldControlsFolderCategories().clipboard,
            }),
            paste: createKeyPatternSetting({
                name: "Paste text",
                init: new KeyPattern("ctrl+v"),
                category: getFieldControlsFolderCategories().clipboard,
            }),
            cut: createKeyPatternSetting({
                name: "Cut text",
                init: new KeyPattern("ctrl+x"),
                category: getFieldControlsFolderCategories().clipboard,
            }),

            // Jumps
            home: createKeyPatternSetting({
                name: "Jump to the start of the input",
                init: new KeyPattern([
                    {pattern: "home", type: "down", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().jumps,
            }),
            end: createKeyPatternSetting({
                name: "Jump to the end of the input",
                init: new KeyPattern([
                    {pattern: "end", type: "down", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().jumps,
            }),
            selectAll: createKeyPatternSetting({
                name: "Select all of the text",
                init: new KeyPattern("ctrl+a"),
                category: getFieldControlsFolderCategories().jumps,
            }),
            jumpWordLeft: createKeyPatternSetting({
                name: "Jump a word to the left",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+left`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().jumps,
            }),
            jumpWordRight: createKeyPatternSetting({
                name: "Jump a word to the right",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+right`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().jumps,
            }),

            // Text navigation
            left: createKeyPatternSetting({
                name: "Move to the left",
                init: new KeyPattern([
                    {pattern: ["left"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
            }),
            right: createKeyPatternSetting({
                name: "Move to the right",
                init: new KeyPattern([
                    {pattern: ["right"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
            }),
            up: createKeyPatternSetting({
                name: "Move the cursor a line up",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["up"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
            }),
            down: createKeyPatternSetting({
                name: "Move the cursor a line down",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["down"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
            }),
            expandSelection: createKeyPatternSetting({
                name: "Expand selection",
                description: "Only the pattern is used, not the event type", // TODO: create a class + UI for modifier patterns
                init: new KeyPattern("shift"),
                category: getFieldControlsFolderCategories().textNavigation,
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
                category: getFieldControlsFolderCategories().insertDelete,
            }),
            delete: createKeyPatternSetting({
                name: "Remove the character behind the cursor",
                init: new KeyPattern([
                    {pattern: ["delete"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
            }),
            insertLine: createKeyPatternSetting({
                name: "Insert a new line",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["enter"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
            }),
            indent: createKeyPatternSetting({
                name: "Inserts an indentation",
                description: "Unused in single line text fields",
                init: new KeyPattern([{pattern: ["tab"], type: "down or repeat"}]),
                category: getFieldControlsFolderCategories().insertDelete,
            }),
            dedent: createKeyPatternSetting({
                name: "Removes an indentation",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["shift", "tab"], type: "down or repeat"},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
            }),

            // Meta controls
            undo: createKeyPatternSetting({
                name: "Undo text",
                init: new KeyPattern([{pattern: ["ctrl", "z"], type: "down or repeat"}]),
                category: getFieldControlsFolderCategories().meta,
            }),
            redo: createKeyPatternSetting({
                name: "Redo text",
                init: new KeyPattern([{pattern: ["ctrl", "y"], type: "down or repeat"}]),
                category: getFieldControlsFolderCategories().meta,
            }),
        },
    });
}

/** The modifier to make the arrow keys jump entire words at once */
export const wordJumpModifier = process.platform == "darwin" ? "alt" : "ctrl";
