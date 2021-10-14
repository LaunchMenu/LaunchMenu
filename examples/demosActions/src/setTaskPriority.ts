import {
    createContextAction,
    singlePromptExecuteHandler,
    promptSelectExecuteHandler,
    Priority,
    createStandardMenuItem,
} from "@launchmenu/core";
import {Field} from "model-react";

export type ITaskPriority = "high" | "medium" | "low";
export const setTaskPriority = createContextAction({
    name: "Set priority level",
    contextItem: {priority: Priority.MEDIUM /* Not to be confused with ITaskPriority */},
    core: (fields: Field<ITaskPriority>[]) => {
        const executeBinding = singlePromptExecuteHandler.createBinding({
            fields,
            valueRetriever: ({field}) =>
                promptSelectExecuteHandler.createBinding({
                    field,
                    options: ["low", "medium", "high"],
                    createOptionView: level => createStandardMenuItem({name: level}),
                }),
        });

        return {
            // Return the bindings for executing the action in the menu
            actionBindings: [executeBinding],
        };
    },
});
