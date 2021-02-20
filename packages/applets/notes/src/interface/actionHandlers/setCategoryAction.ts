import {
    Command,
    CompoundCommand,
    createContextAction,
    createStandardMenuItem,
    editExecuteHandler,
    executeAction,
    groupBy,
    IExecuteArg,
    Priority,
    selectExecuteHandler,
} from "@launchmenu/core";
import {Field} from "model-react";
import {Note} from "../../dataModel/Note";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {ISetCategoryData} from "./_types/ISetCategoryData";

/** An action to set the category of a note */
export const setCategoryAction = createContextAction({
    name: "Set category",
    contextItem: {
        priority: Priority.MEDIUM,
    },
    core: (data: ISetCategoryData[]) => {
        const getExecuteBindings = () => {
            const groups = groupBy(data, "options", arrayEquals);
            return groups.map(({key: options, values: notes}) =>
                editExecuteHandler.createBinding(async ({context}) => {
                    // Obtain the most frequent selection amongst notes as the default
                    const defaultCategory = groupBy(
                        notes
                            .map(({note}) => note.getCategory())
                            .filter((c): c is NoteCategory => !!c),
                        v => v
                    ).reduce(
                        (best, {key, values}) =>
                            values.length > best.count
                                ? {count: values.length, category: key}
                                : best,
                        {count: 0, category: undefined}
                    ).category;

                    // Execute the select handler
                    const field = new Field(defaultCategory);
                    await executeAction.execute(context, [
                        {
                            actionBindings: [
                                selectExecuteHandler.createBinding({
                                    field,
                                    undoable: false,
                                    options: [...options, undefined],
                                    createOptionView: category =>
                                        createStandardMenuItem({
                                            name: h =>
                                                category ? category.getName(h) : "None",
                                            icon: category ? undefined : "delete",
                                        }),
                                }),
                            ],
                        },
                    ]);

                    // Use the result to create a set category command
                    return new CompoundCommand(
                        {name: "Set note category"},
                        notes.map(
                            ({note}) => new SetNoteCategoryCommand(note, field.get())
                        )
                    );
                })
            );
        };

        return {
            // Return the bindings for executing the action in the menu
            actionBindings: getExecuteBindings,
            // As well as some result for programmatic access for extension
            result: {
                execute: ({context}: IExecuteArg) =>
                    executeAction.execute(context, [
                        {actionBindings: getExecuteBindings()},
                    ]),
                getSelectBindings: getExecuteBindings,
            },
        };
    },
});

/**
 * Checks whether arrays a and b are equal (contain exactly the same items)
 * @param a The first array
 * @param b The second array
 * @returns Whether the arrays are equal
 */
function arrayEquals<T>(a: T[], b: T[]): boolean {
    return (
        a.length == b.length &&
        a.every(item => b.includes(item)) &&
        b.every(item => a.includes(item))
    );
}

// Could realistically
/**
 * A command for changing the note's category
 */
export class SetNoteCategoryCommand extends Command {
    public metadata = {
        name: "Set note category",
    };

    protected note: Note;
    protected category: NoteCategory | undefined;
    protected oldCategory: NoteCategory | undefined;

    /**
     * Creates a new set category command
     * @param note The note to update
     * @param category The new category
     */
    public constructor(note: Note, category: NoteCategory | undefined) {
        super();
        this.note = note;
        this.category = category;
    }

    /** @override */
    public async onExecute(): Promise<void> {
        this.oldCategory = this.note.getCategory();
        this.note.setCategory(this.category);
    }

    /** @override */
    public async onRevert(): Promise<void> {
        this.note.setCategory(this.oldCategory);
    }
}
