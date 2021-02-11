import {
    createContextAction,
    executeAction,
    IExecuteArg,
    IField,
    inputExecuteHandler,
    Priority,
} from "@launchmenu/core";
import {Note} from "../../dataModel/Note";

export const setNameAction = createContextAction({
    name: "Set name",
    contextItem: {
        icon: "edit",
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
                return inputExecuteHandler.createBinding({
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
