import {IMenuItem} from "@launchmenu/core";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {NotesSource} from "../../dataModel/NotesSource";
import {setColorAction} from "../actionHandlers/setColorAction";
import {setFontSizeAction} from "../actionHandlers/setFontSizeAction";
import {setRichContentAction} from "../actionHandlers/setRichContentAction";
import {setSyntaxModeAction} from "../actionHandlers/setSyntaxModeAction";
import {createColorableMenuItem} from "../createColorableMenuItem";
import {deleteNoteCategoryHandler} from "./actionHandlers/deleteNoteCategoryHandler";
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
            deleteNoteCategoryHandler.createBinding({category, notesSource}),
            setColorAction.createBinding({
                set: color => category.setColor(color),
                get: h => category.getColor(h),
            }),
            setSyntaxModeAction.createBinding({
                set: syntax => category.setSyntaxMode(syntax),
                get: h => category.getSyntaxMode(h),
            }),
            setFontSizeAction.createBinding({
                set: size => category.setFontSize(size),
                get: h => category.getFontSize(h),
            }),
            setRichContentAction.createBinding({
                set: richContent => category.setShowRichContent(richContent),
                get: h => category.getShowRichContent(h),
            }),
        ],
    });
}
