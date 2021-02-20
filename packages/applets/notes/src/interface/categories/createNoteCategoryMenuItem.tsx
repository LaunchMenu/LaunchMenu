import {IMenuItem} from "@launchmenu/core";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {NotesSource} from "../../dataModel/NotesSource";
import {setColorAction} from "../actionHandlers/noteAppearance/setColorAction";
import {setFontSizeAction} from "../actionHandlers/noteAppearance/setFontSizeAction";
import {setRichContentAction} from "../actionHandlers/noteAppearance/setRichContentAction";
import {setSearchContentAction} from "../actionHandlers/noteAppearance/setSearchContentAction";
import {setSyntaxModeAction} from "../actionHandlers/noteAppearance/setSyntaxModeAction";
import {createColorableMenuItem} from "../createColorableMenuItem";
import {deleteNoteCategoryHandler} from "./actionHandlers/deleteNoteCategoryHandler";
import {setNoteCategoryNameExecuteHandler} from "./actionHandlers/setNoteCategoryNameExecuteHandler";
import {setSearchPatternAction} from "./actionHandlers/setSearchPatternAction";

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
            setSearchPatternAction.createBinding({
                set: pattern => category.setSearchPattern(pattern),
                get: h => category.getSearchPattern(h) ?? "",
            }),
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
            setSearchContentAction.createBinding({
                set: searchContent => category.setSearchContent(searchContent),
                get: h => category.getSearchContent(h),
            }),
        ],
    });
}
