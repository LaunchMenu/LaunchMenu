import {
    createContextAction,
    executeAction,
    IExecuteArg,
    IField,
    promptInputExecuteHandler,
    Priority,
} from "@launchmenu/core";
import {Note} from "../../dataModel/Note";

/**
 * An action to set the name of the note
 */
export const setNoteNameAction = createContextAction({
    name: "Set note name",
    contextItem: {
        icon: "edit",
        name: "Set name",
        priority: Priority.HIGH,
    },
    core: (notes: Note[]) => {
        const getInputBindings = () =>
            notes.map(note => {
                // Create a virtual field
                const field: IField<string> = {
                    get: h => note.getName(h),
                    set: name => note.setName(name),
                };

                // Create the input execute handler
                return promptInputExecuteHandler.createBinding({
                    field,
                });
            });

        return {
            // Return the bindings for executing the action in the menu
            actionBindings: getInputBindings,
            // As well as some result for programmatic access for extension
            result: {
                execute: ({context}: IExecuteArg) =>
                    executeAction.execute(context, [
                        {actionBindings: getInputBindings()},
                    ]),
                getInputBindings,
            },
        };
    },
});
