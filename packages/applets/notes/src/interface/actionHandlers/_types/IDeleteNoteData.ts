import {Note} from "../../../dataModel/Note";
import {NotesSource} from "../../../dataModel/NotesSource";

export type IDeleteNoteData = {
    note: Note;
    /** The notes source that this note belongs to, in case that the deletion is undone */
    notesSource: NotesSource;
};
