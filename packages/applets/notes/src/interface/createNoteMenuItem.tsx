import React from "react";
import {getCategoryAction, ICategory, IMenuItem} from "@launchmenu/core";
import {notesIcon} from "../notesIcon";
import {Note} from "../dataModel/Note";
import {IDataHook, Loader} from "model-react";
import {createColorableMenuItem} from "./createColorableMenuItem";
import {editNoteExecuteAction} from "./actionHandlers/editNoteExecuteAction";
import {NoteCategory} from "../dataModel/NoteCategory";
import {setCategoryAction} from "./actionHandlers/setCategoryAction";
import {setNoteNameAction} from "./actionHandlers/setNoteNameAction";
import {NotesSource} from "../dataModel/NotesSource";
import {deleteNoteHandler} from "./actionHandlers/deleteNoteHandler";
import {notePatternMatcher} from "../notePatternMatcher";

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
        color: h => note.getCategory(h)?.getColor(h),
        icon: notesIcon,
        searchPattern: notePatternMatcher,
        content: (
            <Loader>
                {h => (
                    <>
                        {note
                            .getText(h)
                            .split(/\n/)
                            .flatMap((line, i) => [<br key={i} />, line])
                            .slice(1)}
                    </>
                )}
            </Loader>
        ),
        actionBindings: [
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
        ],
    });
}
