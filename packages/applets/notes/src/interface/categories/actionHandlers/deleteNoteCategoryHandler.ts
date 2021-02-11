import {Command, createAction, deleteAction} from "@launchmenu/core";
import {NoteCategory} from "../../../dataModel/NoteCategory";
import {NotesSource} from "../../../dataModel/NotesSource";
import {INoteCategoryMetadata} from "../../../dataModel/_types/INoteCategoryMetadata";
import {IDeleteNoteCategoryData} from "./_types/IDeleteNoteCategoryData";

/** An action to delete note categories */
export const deleteNoteCategoryHandler = createAction({
    name: "Delete note category",
    parents: [deleteAction],
    core: (notes: IDeleteNoteCategoryData[]) => ({
        children: notes.map(({category, notesSource}) =>
            deleteAction.createBinding(
                () => new DeleteNoteCategoryCommand(category, notesSource)
            )
        ),
    }),
});

/**
 * A command to delete a note category from its source
 */
export class DeleteNoteCategoryCommand extends Command {
    public metadata = {
        name: "Delete note category",
    };

    protected noteCategoryData: INoteCategoryMetadata | undefined;
    protected noteCategory: NoteCategory;
    protected notesSource: NotesSource;

    /**
     * Creates a new delete command
     * @param noteCategory The note category to be deleted
     * @param notesSource The source to delete it from (in order to undo deletion)
     */
    public constructor(noteCategory: NoteCategory, notesSource: NotesSource) {
        super();
        this.noteCategory = noteCategory;
        this.notesSource = notesSource;
    }

    /** @override */
    protected async onExecute(): Promise<void> {
        // Backup the data
        this.noteCategoryData = this.noteCategory.getData();

        // Delete the note
        this.noteCategory.delete();
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        if (!this.noteCategoryData) return;
        const note = await this.notesSource.createNoteCategory(this.noteCategoryData);
    }
}
