import {
    Command,
    createContextAction,
    createStandardMenuItem,
    singlePromptExecuteHandler,
    executeAction,
    groupBy,
    IExecuteArg,
    Priority,
    selectExecuteHandler,
} from "@launchmenu/core";
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
                singlePromptExecuteHandler.createBinding({
                    init: [
                        ...notes
                            .map(({note}) => note.getCategory())
                            .filter((c): c is NoteCategory => !!c),
                        undefined,
                    ],
                    valueRetriever: field =>
                        selectExecuteHandler.createBinding({
                            field,
                            options: [...options, undefined],
                            createOptionView: category =>
                                createStandardMenuItem({
                                    name: h => (category ? category.getName(h) : "None"),
                                    icon: category ? undefined : "delete",
                                }),
                        }),
                    setValues: value =>
                        notes.map(({note}) => new SetNoteCategoryCommand(note, value)),
                    commandName: "Set note category",
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
