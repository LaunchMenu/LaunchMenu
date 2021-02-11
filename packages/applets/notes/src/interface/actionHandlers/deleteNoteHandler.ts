import {Command, createAction, deleteAction, findStackChanges} from "@launchmenu/core";
import {Note} from "../../dataModel/Note";
import {NotesSource} from "../../dataModel/NotesSource";
import {INoteMetadata} from "../../dataModel/_types/INoteMetadata";
import {IDeleteNoteData} from "./_types/IDeleteNoteData";
import FS from "fs";
import {promisify} from "util";

/** An action to delete notes */
export const deleteNoteHandler = createAction({
    name: "Delete note",
    parents: [deleteAction],
    core: (notes: IDeleteNoteData[]) => ({
        children: notes.map(({note, notesSource}) =>
            deleteAction.createBinding(() => new DeleteNoteCommand(note, notesSource))
        ),
    }),
});

/**
 * A command to delete a note from its source
 */
export class DeleteNoteCommand extends Command {
    public metadata = {
        name: "Delete note",
    };

    protected noteData: INoteMetadata | undefined;
    protected noteContent: string | undefined;
    protected note: Note;
    protected notesSource: NotesSource;

    /**
     * Creates a new delete command
     * @param note The note to be deleted
     * @param notesSource The source to delete it from (in order to undo deletion)
     */
    public constructor(note: Note, notesSource: NotesSource) {
        super();
        this.note = note;
        this.notesSource = notesSource;
    }

    /** @override */
    protected async onExecute(): Promise<void> {
        // Backup the data
        this.noteData = this.note.getData();
        this.noteContent = this.note.getText();
        const notePath = this.note.getFilePath();

        // Delete the note
        this.note.delete();

        // Delete the note's file if it was in the main notes dir
        const notesDirPath = this.notesSource.getNotesDir();
        if (notePath.substring(0, notesDirPath.length) == notesDirPath)
            await promisify(FS.unlink)(notePath);
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        if (!this.noteData) return;
        const note = await this.notesSource.createNote(this.noteData);
    }
}
