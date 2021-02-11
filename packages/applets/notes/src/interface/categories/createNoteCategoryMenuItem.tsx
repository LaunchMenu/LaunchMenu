import {IMenuItem} from "@launchmenu/core";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {NotesSource} from "../../dataModel/NotesSource";
import {createColorableMenuItem} from "../createColorableMenuItem";
import {deleteNoteCategoryHandler} from "./actionHandlers/deleteNoteCategoryHandler";
import {setNoteCategoryColorAction} from "./actionHandlers/setNoteCategoryColorAction";
import {setNoteCategoryNameExecuteHandler} from "./actionHandlers/setNoteCategoryNameExecuteHandler";

/**
 * Creates a new note category menu item
 * @param category The category to create the management for
 * @param noteSource The notes source for category restoration
 * @returns The menu item to configure the note category
 */
export function createNoteCategoryMenuItem(
    category: NoteCategory,
    notesSource: NotesSource
): IMenuItem {
    return createColorableMenuItem({
        name: h => category.getName(h),
        color: h => category.getColor(h),
        actionBindings: [
            setNoteCategoryNameExecuteHandler.createBinding(category),
            setNoteCategoryColorAction.createBinding(category),
            deleteNoteCategoryHandler.createBinding({category, notesSource}),
        ],
    });
}
