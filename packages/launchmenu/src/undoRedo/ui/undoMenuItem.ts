import {keyHandlerAction} from "../../menus/actions/types/keyHandler/keyHandlerAction";
import {createStandardMenuItem} from "../../menus/items/createStandardMenuItem";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {undoRedoCategory} from "./undoRedoCategory";

/**
 * A menu item to undo commands in the current scope
 */
export const undoMenuItem = createStandardMenuItem({
    name: "Undo",
    onExecute: ({context}) => {
        context.undoRedo.undo();
    },
    actionBindings: [
        keyHandlerAction.createBinding({
            onKey: (event, context) => {
                if (event.is(["ctrl", "z"])) {
                    context.undoRedo.undo();
                    return true;
                }
            },
        }),
    ],
    category: undoRedoCategory,
});

/**
 * A prioritized menu item to undo commands in the current scope that can be used in a context menu
 */
export const prioritizedUndoMenuItem: IPrioritizedMenuItem = {
    priority: 0.6,
    item: undoMenuItem,
};
