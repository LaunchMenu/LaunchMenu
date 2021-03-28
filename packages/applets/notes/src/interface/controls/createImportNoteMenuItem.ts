import {
    Command,
    createStandardMenuItem,
    executeAction,
    promptFileInputExecuteHandler,
    getControlsCategory,
    IMenuItem,
    sequentialExecuteHandler,
} from "@launchmenu/core";
import {Field} from "model-react";
import {Note} from "../../dataModel/Note";
import {NotesSource} from "../../dataModel/NotesSource";
import {INoteMetadata} from "../../dataModel/_types/INoteMetadata";

/**
 * Creates a new menu item to import notes
 * @param notesSource The notes source to add the item to
 * @param onCreate A callback for when a note is created
 * @returns The menu item that can be used to create new notes
 */
export function createImportNoteMenuItem(
    notesSource: NotesSource,
    onCreate?: (note: Note, initial: boolean) => void
): IMenuItem {
    return createStandardMenuItem({
        name: "Import note",
        category: getControlsCategory(),
        actionBindings: [
            sequentialExecuteHandler.createBinding(async ({context}) => {
                // Create a field to store the input name, and request an input from the user
                const field = new Field("");
                await executeAction.execute(context, [
                    {
                        actionBindings: [
                            promptFileInputExecuteHandler.createBinding({
                                field,
                                undoable: false,
                            }),
                        ],
                    },
                ]);

                // Create the command to execute with the retrieved name
                const path = field.get();
                if (path) return new ImportNoteCommand(path, notesSource, onCreate);
            }),
        ],
    });
}

/** A command to import a note to a notes source */
export class ImportNoteCommand extends Command {
    public metadata = {
        name: "Import note",
    };

    protected notesSource: NotesSource;
    protected note: Note;
    protected path: string;
    protected noteData: INoteMetadata | undefined;
    protected onCreate: (note: Note, initial: boolean) => void;

    /**
     * Creates a new import note command
     * @param path The path to the note
     * @param source The notes source to add the note to
     * @param onCreate A callback for when the note is created
     */
    public constructor(
        path: string,
        source: NotesSource,
        onCreate: (
            note: Note,
            /** Whether it was the first creation, not a redo */
            initial: boolean
        ) => void = () => {}
    ) {
        super();
        this.path = path;
        this.notesSource = source;
        this.onCreate = onCreate;
    }

    /** @override */
    protected async onExecute(): Promise<void> {
        // If there was any note data, restore it to keep the future stack valid
        if (this.noteData) this.note = await this.notesSource.createNote(this.noteData);
        // Create a new note from scratch on first execution
        else this.note = await this.notesSource.importNote(this.path);

        // Invoke the callback
        this.onCreate(this.note, !this.noteData);
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        this.noteData = this.note.getData();
        this.note?.delete();
    }
}
