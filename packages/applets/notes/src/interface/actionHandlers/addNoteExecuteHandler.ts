import {
    Command,
    createCallbackHook,
    createContextAction,
    executeAction,
    inputExecuteHandler,
    sequentialExecuteHandler,
} from "@launchmenu/core";
import {Field} from "model-react";
import {Note} from "../../dataModel/Note";
import {NotesSource} from "../../dataModel/NotesSource";
import {INoteMetadata} from "../../dataModel/_types/INoteMetadata";
import {editNoteExecuteAction} from "./editNoteExecuteAction";
import {IAddNoteCallback, IAddNoteExecuteData} from "./_types/IAddNoteExecuteData";

/** An execute handler to create new notes */
export const addNoteExecuteHandler = createContextAction({
    name: "Add note execute handler",
    contextItem: {
        name: "Create note",
        priority: executeAction.priority,
    },
    parents: [sequentialExecuteHandler],
    core: (data: IAddNoteExecuteData[]) => ({
        children: data.map(({callback, notesSource, category, edit = true}) =>
            sequentialExecuteHandler.createBinding(async ({context}) => {
                // Create a field to store the input name, and request an input from the user
                const field = new Field("");
                let fieldChange = false;
                field.get(
                    createCallbackHook(() => {
                        fieldChange = true;
                    })[0]
                );
                await executeAction.execute(context, [
                    {
                        actionBindings: [
                            inputExecuteHandler.createBinding({field, undoable: false}),
                        ],
                    },
                ]);

                if (!fieldChange) return;

                // Create the command to execute with the retrieved name
                return new AddNoteCommand(
                    field.get(),
                    notesSource,
                    async (note, initial) => {
                        if (category) note.setCategory(category);

                        // Edit the note if requested
                        if (edit)
                            await executeAction.execute(context, [
                                {
                                    actionBindings: [
                                        editNoteExecuteAction.createBinding(note),
                                    ],
                                },
                            ]);

                        // Call the callback
                        await callback(note, initial);
                    }
                );
            })
        ),
    }),
});

/** A command to add a note to a notes source */
export class AddNoteCommand extends Command {
    public metadata = {
        name: "Add note",
    };

    protected notesSource: NotesSource;
    protected note: Note;
    protected name: string;
    protected noteData: INoteMetadata | undefined;
    protected onCreate: IAddNoteCallback;

    /**
     * Creates a new add note command
     * @param name The name of the note
     * @param source The notes source to add the note to
     * @param onCreate A callback for when the note is created
     */
    public constructor(
        name: string,
        source: NotesSource,
        onCreate: IAddNoteCallback = () => Promise.resolve()
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
        await this.onCreate(this.note, !this.noteData);
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        this.noteData = this.note.getData();
        this.note?.delete();
    }
}
