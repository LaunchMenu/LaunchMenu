import {KeyPattern} from "../../../../../../keyHandler/KeyPattern";
import {IKeyPatternOptionMenuItemData} from "./_types/IKeyPatternOptionMenuItemData";
import {updateKeyPatternOptionExecuteHandler} from "./actionHandlers/updateKeyPatternOptionExecuteHandler";
import {deleteKeyPatternOptionHandler} from "./actionHandlers/deleteKeyPatternOptionHandler";
import {updateKeyPatternOptionTypeAction} from "./actionHandlers/updateKeyPatternOptionTypeAction";
import {updateKeyPatternOptionExtrasAction} from "./actionHandlers/updateKeyPatternOptionExtrasAction";
import {createStandardMenuItem} from "../../../../createStandardMenuItem";
import {IMenuItem} from "../../../../_types/IMenuItem";

/**
 * Creates an item to be able to alter the pattern at the given index
 * @param data All the data to create the item
 * @returns The menu item
 */
export function createKeyPatternOptionMenuItem({
    patternField,
    option,
    globalShortcutOnly,
}: IKeyPatternOptionMenuItemData): IMenuItem {
    return createStandardMenuItem({
        name: KeyPattern.toStringPattern(option.pattern),
        actionBindings: [
            updateKeyPatternOptionExecuteHandler.createBinding({
                patternField,
                option,
                globalShortcutOnly,
            }),
            deleteKeyPatternOptionHandler.createBinding({option, patternField}),
            ...(globalShortcutOnly
                ? []
                : [
                      updateKeyPatternOptionTypeAction.createBinding({
                          patternField,
                          option,
                      }),
                      updateKeyPatternOptionExtrasAction.createBinding({
                          patternField,
                          option,
                      }),
                  ]),
        ],
    });
}
