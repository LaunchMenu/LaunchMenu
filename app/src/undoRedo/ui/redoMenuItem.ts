import {keyHandlerAction} from "../../menus/actions/types/keyHandler/keyHandlerAction";
import {createStandardMenuItem} from "../../menus/items/createStandardMenuItem";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {undoRedoCategory} from "./undoRedoCategory";

/**
 * A menu item to redo commands in the current scope
 */
export const redoMenuItem = createStandardMenuItem({
    name: "Redo",
    onExecute: ({context}) => {
        context.undoRedo.redo();
    },
    actionBindings: [
        keyHandlerAction.createBinding({
            onKey: (event, context) => {
                if (event.is(["ctrl", "y"])) {
                    context.undoRedo.redo();
                    return true;
                }
            },
        }),
    ],
    category: undoRedoCategory,
});

/**
 * A prioritized menu item to redo commands in the current scope that can be used in a context menu
 */
export const prioritizedRedoMenuItem: IPrioritizedMenuItem = {
    priority: 0.5,
    item: redoMenuItem,
};
