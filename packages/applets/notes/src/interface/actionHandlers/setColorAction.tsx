import {
    CompoundCommand,
    createContextAction,
    executeAction,
    groupBy,
    IExecuteArg,
    IField,
    Priority,
    sequentialExecuteHandler,
    SetFieldCommand,
} from "@launchmenu/core";
import React from "react";
import {Field} from "model-react";
import {editStylingFolderHandler} from "./editStylingFolderHandler";
import {inheritableColorInputExecuteHandler} from "./inheritableColorInputExecuteHandler";

/**
 * An action to set the color of a note
 */
export const setColorAction = createContextAction({
    name: "Set note color",
    contextItem: {
        icon: "edit",
        name: "Set color",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 7],
        content: (
            <>
                Sets whether the color of the note, "inherit" can be specified to inherit
                a default value.
            </>
        ),
    },
    folder: editStylingFolderHandler,
    core: (fields: IField<string>[]) => {
        const execute = async ({context}: IExecuteArg) => {
            // Obtain the most frequent selection amongst notes as the default
            const defaultColor =
                groupBy(
                    fields.map(field => field.get()),
                    v => v
                ).reduce(
                    (best, {key, values}) =>
                        values.length > best.count
                            ? {count: values.length, color: key}
                            : best,
                    {count: 0, color: undefined}
                ).color || "inherit";

            // Execute the select handler
            const choiceField = new Field(defaultColor);
            await executeAction.execute(context, [
                {
                    actionBindings: [
                        inheritableColorInputExecuteHandler.createBinding({
                            field: choiceField,
                            undoable: false,
                        }),
                    ],
                },
            ]);

            // Use the result to create a set category command
            return new CompoundCommand(
                {name: "Set note color"},
                fields.map(field => new SetFieldCommand(field, choiceField.get()))
            );
        };

        return {
            // Return the bindings for executing the action in the menu
            actionBindings: [sequentialExecuteHandler.createBinding(execute)],
            // As well as some result for programmatic access for extension
            result: {
                execute,
            },
        };
    },
});
