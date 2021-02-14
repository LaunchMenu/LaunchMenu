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
import {
    highlightLanguages,
    IHighlightLanguage,
} from "../../dataModel/_types/IHighlightLanguage";
import {IInherit, inherit} from "../../dataModel/_types/IInherit";
import {editStylingFolderHandler} from "./editStylingFolderHandler";

/**
 * An action to set the syntax mode for a note
 */
export const setSyntaxModeAction = createContextAction({
    name: "Set note syntax mode",
    contextItem: {
        icon: "edit",
        name: "Set syntax mode",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 6],
        content: (
            <>
                Sets the syntax mode of the note, "inherit" can be specified to inherit a
                default value.
            </>
        ),
    },
    folder: editStylingFolderHandler,
    core: (fields: IField<IHighlightLanguage | IInherit>[]) => {
        const execute = async ({context}: IExecuteArg) => {
            // Obtain the most frequent selection amongst notes as the default
            const defaultRichContent =
                groupBy(
                    fields.map(field => field.get()),
                    v => v
                ).reduce(
                    (best, {key, values}) =>
                        values.length > best.count
                            ? {count: values.length, language: key}
                            : best,
                    {count: 0, language: undefined}
                ).language ?? "inherit";

            // Execute the select handler
            const choiceField = new Field(defaultRichContent);
            await executeAction.execute(context, [
                {
                    actionBindings: [
                        selectExecuteHandler.createBinding({
                            field: choiceField,
                            undoable: false,
                            options: [...highlightLanguages, inherit],
                            createOptionView: v =>
                                createStandardMenuItem({name: v.toString()}),
                        }),
                    ],
                },
            ]);

            // Use the result to create a set category command
            return new CompoundCommand(
                {name: "Set syntax mode"},
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
