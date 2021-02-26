import {
    CompoundCommand,
    createContextAction,
    createStandardMenuItem,
    executeAction,
    groupBy,
    IExecuteArg,
    IField,
    Priority,
    selectExecuteHandler,
    sequentialExecuteHandler,
    SetFieldCommand,
} from "@launchmenu/core";
import React from "react";
import {Field} from "model-react";
import {IInherit, inherit} from "../../../dataModel/_types/IInherit";
import {editStylingFolderHandler} from "../editStylingFolderHandler";

/**
 * An action to set whether to search content for a note
 */
export const setSearchContentAction = createContextAction({
    name: "Set note search content",
    contextItem: {
        icon: "edit",
        name: "Set enable search content",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 10],
        content: (
            <>
                Sets whether the note should be findable by its content. This may make
                searches in LM more laggy when enabled for big files. "inherit" can be
                specified to inherit a default value.
            </>
        ),
    },
    folder: editStylingFolderHandler,
    core: (fields: IField<boolean | IInherit>[]) => {
        const execute = async ({context}: IExecuteArg) => {
            // Obtain the most frequent selection amongst notes as the default
            const defaultSearchContent =
                groupBy(
                    fields.map(field => field.get()),
                    v => v
                ).reduce(
                    (best, {key, values}) =>
                        values.length > best.count
                            ? {count: values.length, searchContent: key}
                            : best,
                    {count: 0, searchContent: undefined}
                ).searchContent ?? "inherit";

            // Execute the select handler
            const choiceField = new Field(defaultSearchContent);
            await executeAction.execute(context, [
                {
                    actionBindings: [
                        selectExecuteHandler.createBinding({
                            field: choiceField,
                            undoable: false,
                            options: [true, false, inherit],
                            createOptionView: v =>
                                createStandardMenuItem({name: v.toString()}),
                        }),
                    ],
                },
            ]);

            // Use the result to create a set category command
            return new CompoundCommand(
                {name: "Set enable search content"},
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
