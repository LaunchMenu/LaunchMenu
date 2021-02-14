import React from "react";
import {
    getCategoryAction,
    getContentAction,
    ICategory,
    IMenuItem,
} from "@launchmenu/core";
import {notesIcon} from "../notesIcon";
import {Note} from "../dataModel/Note";
import {IDataHook, Loader} from "model-react";
import {createColorableMenuItem} from "./createColorableMenuItem";
import {editNoteExecuteAction} from "./actionHandlers/editNoteExecuteAction";
import {setCategoryAction} from "./actionHandlers/setCategoryAction";
import {setNoteNameAction} from "./actionHandlers/setNoteNameAction";
import {NotesSource} from "../dataModel/NotesSource";
import {deleteNoteHandler} from "./actionHandlers/deleteNoteHandler";
import {notePatternMatcher} from "../notePatternMatcher";
import {setColorAction} from "./actionHandlers/setColorAction";
import {setSyntaxModeAction} from "./actionHandlers/setSyntaxModeAction";
import {setFontSizeAction} from "./actionHandlers/setFontSizeAction";
import {setRichContentAction} from "./actionHandlers/setRichContentAction";
import {noteContentHandler} from "./actionHandlers/noteContentHandler";

/**
 * Creates a menu item for the given note
 * @param note The note to create an item for
 * @param notesSource The source of the notes
 * @param getCategories All the available note categories
 * @returns The created menu item
 */
export function createNoteMenuItem(
    note: Note,
    notesSource: NotesSource,
    getCategories: (h?: IDataHook) => ICategory[]
): IMenuItem {
    return createColorableMenuItem({
        name: h => note.getName(h),
        color: h => note.getColor(h),
        icon: notesIcon,
        searchPattern: notePatternMatcher,
        // content: (
        //     <Loader>
        //         {h => (
        //             <>
        //                 {note
        //                     .getText(h)
        //                     .split(/\n/)
        //                     .flatMap((line, i) => [<br key={i} />, line])
        //                     .slice(1)}
        //             </>
        //         )}
        //     </Loader>
        // ),
        actionBindings: [
            noteContentHandler.createBinding(note),
            editNoteExecuteAction.createBinding(note),
            setNoteNameAction.createBinding(note),
            deleteNoteHandler.createBinding({note, notesSource}),
            setCategoryAction.createBinding({
                subscribableData: h => ({
                    note,
                    options: notesSource.getAllCategories(h),
                }),
            }),
            getCategoryAction.createBinding({
                subscribableData: h => {
                    const categoryID = note.getCategory(h)?.ID;
                    if (!categoryID) return;
                    return getCategories(h).find(({name}) => name == categoryID);
                },
            }),
            setColorAction.createBinding({
                set: color => note.setColor(color),
                get: h => note.getColor(h),
            }),
            setSyntaxModeAction.createBinding({
                set: syntax => note.setSyntaxMode(syntax),
                get: h => note.getSyntaxMode(h),
            }),
            setFontSizeAction.createBinding({
                set: size => note.setFontSize(size),
                get: h => note.getFontSize(h),
            }),
            setRichContentAction.createBinding({
                set: richContent => note.setShowRichContent(richContent),
                get: h => note.getShowRichContent(h),
            }),
        ],
    });
}
