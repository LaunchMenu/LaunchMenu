import {Note} from "../../../dataModel/Note";
import {NoteCategory} from "../../../dataModel/NoteCategory";
import {NotesSource} from "../../../dataModel/NotesSource";

export type IAddNoteExecuteData = {
    /** The source to add the note to */
    notesSource: NotesSource;
    /** The callback when adding a note */
    callback: IAddNoteCallback;
    /** The category to put the note in */
    category?: NoteCategory;
    /** Whether to edit the note after creation, defaults to true */
    edit?: boolean;
};

/** The callback when adding a note */
export type IAddNoteCallback = {
    /**
     * The callback for when the note is added
     * @param note THe note that was created
     * @param initial Whether the first time the note was created, or a redo
     */
    (note: Note, initial: boolean): Promise<void>;
};
