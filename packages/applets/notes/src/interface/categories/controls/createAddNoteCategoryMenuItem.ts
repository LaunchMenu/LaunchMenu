import {
    Command,
    createStandardMenuItem,
    executeAction,
    getControlsCategory,
    IMenuItem,
    promptInputExecuteHandler,
    sequentialExecuteHandler,
} from "@launchmenu/core";
import {Field} from "model-react";
import {NoteCategory} from "../../../dataModel/NoteCategory";
import {NotesSource} from "../../../dataModel/NotesSource";
import {INoteCategoryMetadata} from "../../../dataModel/_types/INoteCategoryMetadata";

/**
 * Creates a new menu item to add new note categories
 * @param notesSource The notes source to add the item to
 * @param onCreate A callback for when a note category is created
 * @returns The menu item that can be used to create new note categories
 */
export function createAddNoteCategoryMenuItem(
    notesSource: NotesSource,
    onCreate?: (noteCategory: NoteCategory, initial: boolean) => void
): IMenuItem {
    return createStandardMenuItem({
        name: "Add category",
        category: getControlsCategory(),
        actionBindings: [
            sequentialExecuteHandler.createBinding(async ({context}) => {
                // Create a field to store the input name, and request an input from the user
                const field = new Field("");
                await executeAction.execute(context, [
                    {
                        actionBindings: [
                            promptInputExecuteHandler.createBinding({
                                field,
                                undoable: false,
                            }),
                        ],
                    },
                ]);

                // Create the command to execute with the retrieved name
                return new AddNoteCategoryCommand(field.get(), notesSource, onCreate);
            }),
        ],
    });
}

/** A command to add a note category to a notes source */
export class AddNoteCategoryCommand extends Command {
    public metadata = {
        name: "Add note category",
    };

    protected notesSource: NotesSource;
    protected noteCategory: NoteCategory;
    protected name: string;
    protected noteCategoryData: INoteCategoryMetadata | undefined;
    protected onCreate: (noteCategory: NoteCategory, initial: boolean) => void;

    /**
     * Creates a new add note category command
     * @param name The name of the note category
     * @param source The notes source to add the note to
     * @param onCreate A callback for when the category is created
     */
    public constructor(
        name: string,
        source: NotesSource,
        onCreate: (
            noteCategory: NoteCategory,
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
        // If there was any note category data, restore it to keep the future stack valid
        if (this.noteCategoryData)
            this.noteCategory = await this.notesSource.createNoteCategory(
                this.noteCategoryData
            );
        // Create a new note category from scratch on first execution
        else this.noteCategory = await this.notesSource.addNoteCategory(this.name);

        // Invoke the callback
        this.onCreate(this.noteCategory, !this.noteCategoryData);
    }

    /** @override */
    protected async onRevert(): Promise<void> {
        this.noteCategoryData = this.noteCategory.getData();
        this.noteCategory?.delete();
    }
}
