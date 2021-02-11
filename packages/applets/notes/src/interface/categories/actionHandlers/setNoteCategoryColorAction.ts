import {
    colorInputExecuteHandler,
    createContextAction,
    executeAction,
    IExecuteArg,
    IField,
    Priority,
} from "@launchmenu/core";
import {NoteCategory} from "../../../dataModel/NoteCategory";

/**
 * An action to set the color of the note category
 */
export const setNoteCategoryColorAction = createContextAction({
    name: "Set note category color",
    contextItem: {
        icon: "edit",
        name: "Set color",
        priority: Priority.MEDIUM,
    },
    core: (categories: NoteCategory[]) => {
        const getInputBindings = () =>
            categories.map(category => {
                // Create a virtual field
                const field: IField<string> = {
                    get: h => category.getColor(h),
                    set: name => category.setColor(name),
                };

                // Create the color input execute handler
                return colorInputExecuteHandler.createBinding({
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
