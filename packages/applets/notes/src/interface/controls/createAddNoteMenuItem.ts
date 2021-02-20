import {
    Command,
    createStandardMenuItem,
    executeAction,
    getControlsCategory,
    IMenuItem,
    inputExecuteHandler,
    searchAction,
    sequentialExecuteHandler,
    tracedRecursiveSearchHandler,
} from "@launchmenu/core";
import {Field} from "model-react";
import {Note} from "../../dataModel/Note";
import {NotesSource} from "../../dataModel/NotesSource";
import {INoteMetadata} from "../../dataModel/_types/INoteMetadata";

/**
 * Creates a new menu item to add new notes
 * @param notesSource The notes source to add the item to
 * @param onCreate A callback for when a note is created
 * @returns The menu item that can be used to create new notes
 */
export function createAddNoteMenuItem(
    notesSource: NotesSource,
    onCreate?: (note: Note, initial: boolean) => void
): IMenuItem {
    return createStandardMenuItem({
        name: "Add note",
        category: getControlsCategory(),
        actionBindings: [
            sequentialExecuteHandler.createBinding(async ({context}) => {
                // Create a field to store the input name, and request an input from the user
                const field = new Field("");
                await executeAction.execute(context, [
                    {
                        actionBindings: [
                            inputExecuteHandler.createBinding({field, undoable: false}),
                        ],
                    },
                ]);

                // Create the command to execute with the retrieved name
                return new AddNoteCommand(field.get(), notesSource, onCreate);
            }),
        ],
    });
}

/** A command to add a note to a notes source */
export class AddNoteCommand extends Command {
    public metadata = {
        name: "Add note",
    };

    protected notesSource: NotesSource;
    protected note: Note;
    protected name: string;
    protected noteData: INoteMetadata | undefined;
    protected onCreate: (note: Note, initial: boolean) => void;

    /**
     * Creates a new add note command
     * @param name The name of the note
     * @param source The notes source to add the note to
     * @param onCreate A callback for when the note is created
     */
    public constructor(
        name: string,
        source: NotesSource,
        onCreate: (
            note: Note,
            /** Whether it was the first creation, not a redo */
            initial: boolean
        ) => void = () => {}
    ) {
        super();
        this.name = name;
        this.notesSource = source;
        this.onCreate = onCreate;
    }

    /** @override */
    protected async onExecute(): Promise<void> {
        // If there was any note data, restore it to keep the future stack valid
        if (this.noteData) this.note = await this.notesSource.createNote(this.noteData);
        // Create a new note from scratch on first execution
        else this.note = await this.notesSource.addNote(this.name);

        // Invoke the callback
        this.onCreate(this.note, !this.noteData);
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        this.noteData = this.note.getData();
        this.note?.delete();
    }
}
