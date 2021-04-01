import {
    copyAction,
    copyTextHandler,
    getCategoryAction,
    ICategory,
    IMenuItem,
} from "@launchmenu/core";
import {notesIcon} from "../notesIcon";
import {Note} from "../dataModel/Note";
import {IDataHook, IDataRetriever, Loader} from "model-react";
import {createColorableMenuItem} from "./createColorableMenuItem";
import {editNoteExecuteAction} from "./actionHandlers/editNoteExecuteAction";
import {setCategoryAction} from "./actionHandlers/setCategoryAction";
import {setNoteNameAction} from "./actionHandlers/setNoteNameAction";
import {NotesSource} from "../dataModel/NotesSource";
import {deleteNoteHandler} from "./actionHandlers/deleteNoteHandler";
import {notePatternMatcher} from "../notePatternMatcher";
import {setColorAction} from "./actionHandlers/noteAppearance/setColorAction";
import {setSyntaxModeAction} from "./actionHandlers/noteAppearance/setSyntaxModeAction";
import {setFontSizeAction} from "./actionHandlers/noteAppearance/setFontSizeAction";
import {setRichContentAction} from "./actionHandlers/noteAppearance/setRichContentAction";
import {noteContentHandler} from "./actionHandlers/noteContentHandler";
import {ISettings, settings} from "../settings";
import {setSearchContentAction} from "./actionHandlers/noteAppearance/setSearchContentAction";

/**
 * Creates a menu item for the given note
 * @param note The note to create an item for
 * @param notesSource The source of the notes
 * @param getCategories All the available note categories
 * @param settingsContext The context to get settings from
 * @returns The created menu item
 */
export function createNoteMenuItem(
    note: Note,
    notesSource: NotesSource,
    getCategories: IDataRetriever<ICategory[]>,
    settings: ISettings
): IMenuItem {
    const useInlineCategory = (h?: IDataHook) => settings.inlineCategory.get(h);
    return createColorableMenuItem({
        name: h => note.getName(h),
        color: h => note.getColor(h),
        icon: notesIcon,
        searchPattern: (query, hook) =>
            notePatternMatcher(query, hook) ??
            note.getCategory(hook)?.getSearchPatternMatcher()(query, hook),
        rightAlignDescription: true,
        description: h =>
            useInlineCategory(h) ? note.getCategory(h)?.getName(h) : undefined,
        tags: h => {
            const category = note.getCategory(h);
            return [
                ...(note.getSearchContent(h) ? [note.getText(h)] : []),
                ...(category ? [category.getName(h)] : []),
                // An empty tag allows for results without queries
                "",
            ];
        },
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
                    if (useInlineCategory(h)) return;
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
            setSearchContentAction.createBinding({
                set: searchContent => note.setSearchContent(searchContent),
                get: h => note.getSearchContent(h),
            }),
            copyAction.createBinding(
                copyTextHandler.createBinding({subscribableData: h => note.getText(h)})
            ),
        ],
    });
}
