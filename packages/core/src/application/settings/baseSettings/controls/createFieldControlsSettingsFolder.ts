import {createStandardCategory} from "../../../../menus/categories/createStandardCategory";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createKeyPatternSetting} from "../../../../settings/inputs/createKeyPatternSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {constGetter} from "../../../../utils/constGetter";
import {cmdModifier} from "../../../../utils/platform/cmdModifier";
import {wordJumpModifier} from "../../../../utils/platform/wordJumpModifier";

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
                init: new KeyPattern(`${cmdModifier}+c`),
                category: getFieldControlsFolderCategories().clipboard,
                tags: ["text", "input"],
            }),
            paste: createKeyPatternSetting({
                name: "Paste text",
                init: new KeyPattern(`${cmdModifier}+v`),
                category: getFieldControlsFolderCategories().clipboard,
                tags: ["text", "input"],
            }),
            cut: createKeyPatternSetting({
                name: "Cut text",
                init: new KeyPattern(`${cmdModifier}+x`),
                category: getFieldControlsFolderCategories().clipboard,
                tags: ["text", "input"],
            }),

            // Jumps
            home: createKeyPatternSetting({
                name: "Move caret to start of line",
                init: new KeyPattern([
                    {pattern: "home", type: "down", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().jumps,
                tags: ["text", "input", "caret", "cursor"],
            }),
            end: createKeyPatternSetting({
                name: "Move caret to end of line",
                init: new KeyPattern([
                    {pattern: "end", type: "down", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().jumps,
                tags: ["text", "input", "caret", "cursor"],
            }),
            selectAll: createKeyPatternSetting({
                name: "Select all text",
                init: new KeyPattern(`${cmdModifier}+a`),
                category: getFieldControlsFolderCategories().jumps,
                tags: ["text", "input"],
            }),
            jumpWordLeft: createKeyPatternSetting({
                name: "Move caret a word left",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+left`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().jumps,
                tags: ["text", "input", "caret", "cursor"],
            }),
            jumpWordRight: createKeyPatternSetting({
                name: "Move caret a word right",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+right`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().jumps,
                tags: ["text", "input", "caret", "cursor"],
            }),

            // Text navigation
            left: createKeyPatternSetting({
                name: "Move caret left",
                init: new KeyPattern([
                    {pattern: ["left"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
                tags: ["text", "input", "caret", "cursor"],
            }),
            right: createKeyPatternSetting({
                name: "Move caret right",
                init: new KeyPattern([
                    {pattern: ["right"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
                tags: ["text", "input", "caret", "cursor"],
            }),
            up: createKeyPatternSetting({
                name: "Move caret up",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["up"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
                tags: ["text", "input", "caret", "cursor"],
            }),
            down: createKeyPatternSetting({
                name: "Move caret down",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["down"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().textNavigation,
                tags: ["text", "input", "caret", "cursor"],
            }),
            expandSelection: createKeyPatternSetting({
                name: "Expand selection",
                description: "Only the pattern is used, not the event type", // TODO: create a class + UI for modifier patterns
                init: new KeyPattern("shift"),
                category: getFieldControlsFolderCategories().textNavigation,
                tags: ["text", "input"],
            }),

            // Text insertion and deletion
            backspace: createKeyPatternSetting({
                name: "Remove character before caret",
                init: new KeyPattern([
                    {
                        pattern: ["backspace"],
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input", "delete"],
            }),
            delete: createKeyPatternSetting({
                name: "Remove character after caret",
                init: new KeyPattern([
                    {pattern: ["delete"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input", "delete"],
            }),
            insertLine: createKeyPatternSetting({
                name: "Insert a new line",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["enter"], type: "down or repeat", allowExtra: ["shift"]},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input"],
            }),
            indent: createKeyPatternSetting({
                name: "Inserts an indentation",
                description: "Unused in single line text fields",
                init: new KeyPattern([{pattern: ["tab"], type: "down or repeat"}]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input"],
            }),
            dedent: createKeyPatternSetting({
                name: "Removes an indentation",
                description: "Unused in single line text fields",
                init: new KeyPattern([
                    {pattern: ["shift", "tab"], type: "down or repeat"},
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input"],
            }),
            backwardsDeleteWord: createKeyPatternSetting({
                name: "Deletes a word backwards",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+backspace`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input", "delete"],
            }),
            forwardsDeleteWord: createKeyPatternSetting({
                name: "Deletes a word forwards",
                init: new KeyPattern([
                    {
                        pattern: `${wordJumpModifier}+delete`,
                        type: "down or repeat",
                        allowExtra: ["shift"],
                    },
                ]),
                category: getFieldControlsFolderCategories().insertDelete,
                tags: ["text", "input", "delete"],
            }),

            // Meta controls
            undo: createKeyPatternSetting({
                name: "Undo text",
                init: new KeyPattern([
                    {pattern: [cmdModifier, "z"], type: "down or repeat"},
                ]),
                category: getFieldControlsFolderCategories().meta,
                tags: ["text", "input"],
            }),
            redo: createKeyPatternSetting({
                name: "Redo text",
                init: new KeyPattern([
                    {pattern: [cmdModifier, "y"], type: "down or repeat"},
                ]),
                category: getFieldControlsFolderCategories().meta,
                tags: ["text", "input"],
            }),
        },
    });
}
