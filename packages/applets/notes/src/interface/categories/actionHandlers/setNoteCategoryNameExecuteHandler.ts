import {
    createContextAction,
    executeAction,
    IExecuteArg,
    IField,
    promptInputExecuteHandler,
    Priority,
} from "@launchmenu/core";
import {NoteCategory} from "../../../dataModel/NoteCategory";

/**
 * An action to set the name of the note category
 */
export const setNoteCategoryNameExecuteHandler = createContextAction({
    name: "Set note category name",
    contextItem: {
        icon: "edit",
        name: "Set name",
        priority: Priority.HIGH,
    },
    parents: [promptInputExecuteHandler],
    core: (categories: NoteCategory[]) => {
        const bindings = categories.map(category => {
            // Create a virtual field
            const field: IField<string> = {
                get: h => category.getName(h),
                set: name => category.setName(name),
            };

            // Create the input execute handler
            return promptInputExecuteHandler.createBinding({
                field,
            });
        });

        return {
            children: bindings,
            // As well as some result for programmatic access for extension
            result: {
                execute: ({context}: IExecuteArg) =>
                    executeAction.execute(context, [{actionBindings: bindings}]),
                getInputBindings: () => bindings,
            },
        };
    },
});
