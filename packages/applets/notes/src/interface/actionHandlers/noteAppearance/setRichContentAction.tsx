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
 * An action to set whether to use rich content for a note
 */
export const setRichContentAction = createContextAction({
    name: "Set note rich content",
    contextItem: {
        icon: "edit",
        name: "Set enable rich content",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 15],
        content: (
            <>
                Sets whether the note should render rich content. This is only has an
                effect if the syntax mode is set to "Text", "Html" or "Markdown".
                "inherit" can be specified to inherit a default value.
            </>
        ),
    },
    folder: editStylingFolderHandler,
    core: (fields: IField<boolean | IInherit>[]) => {
        const execute = async ({context}: IExecuteArg) => {
            // Obtain the most frequent selection amongst notes as the default
            const defaultRichContent =
                groupBy(
                    fields.map(field => field.get()),
                    v => v
                ).reduce(
                    (best, {key, values}) =>
                        values.length > best.count
                            ? {count: values.length, richContent: key}
                            : best,
                    {count: 0, richContent: undefined}
                ).richContent ?? "inherit";

            // Execute the select handler
            const choiceField = new Field(defaultRichContent);
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
                {name: "Set enable rich content"},
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
