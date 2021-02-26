import {NoteCategory} from "../../../../dataModel/NoteCategory";
import {NotesSource} from "../../../../dataModel/NotesSource";

export type IDeleteNoteCategoryData = {
    category: NoteCategory;
    /** The notes source that this note belongs to, in case that the deletion is undone */
    notesSource: NotesSource;
};
