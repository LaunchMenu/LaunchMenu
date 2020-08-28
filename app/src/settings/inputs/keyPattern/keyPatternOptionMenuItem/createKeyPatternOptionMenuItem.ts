import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {KeyPattern} from "../KeyPattern";
import {createStandardMenuItem} from "../../../../menus/items/createStandardMenuItem";
import {IKeyPatternOptionMenuItemData} from "./_types/IKeyPatternOptionMenuItemData";
import {updateKeyPatternOptionExecuteHandler} from "./actionHandlers/updateKeyPatternOptionExecuteHandler";
import {deleteKeyPatternOptionHandler} from "./actionHandlers/deleteKeyPatternOptionHandler";
import {updateKeyPatternOptionTypeAction} from "./actionHandlers/updateKeyPatternOptionTypeAction";
import {updateKeyPatternOptionExtrasAction} from "./actionHandlers/updateKeyPatternOptionExtrasAction";

/**
 * Creates an item to be able to alter the pattern at the given index
 * @param data All the data to create the item
 * @returns The menu item
 */
export function createKeyPatternOptionMenuItem({
    patternField,
    option,
    context,
}: IKeyPatternOptionMenuItemData): IMenuItem {
    return createStandardMenuItem({
        name: KeyPattern.toStringPattern(option.pattern),
        actionBindings: [
            updateKeyPatternOptionExecuteHandler.createBinding({
                patternField,
                option,
                context,
            }),
            deleteKeyPatternOptionHandler.createBinding({option, patternField}),
            updateKeyPatternOptionTypeAction.createBinding({
                patternField,
                option,
                context,
            }),
            updateKeyPatternOptionExtrasAction.createBinding({
                patternField,
                option,
                context,
            }),
        ],
    });
}