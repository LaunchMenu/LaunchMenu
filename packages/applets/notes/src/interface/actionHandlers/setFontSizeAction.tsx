import {
    checkTextNumberConstraints,
    CompoundCommand,
    createContextAction,
    executeAction,
    groupBy,
    IExecuteArg,
    IField,
    inputExecuteHandler,
    Priority,
    sequentialExecuteHandler,
    SetFieldCommand,
} from "@launchmenu/core";
import React from "react";
import {Field} from "model-react";
import {IInherit, inherit} from "../../dataModel/_types/IInherit";
import {editStylingFolderHandler} from "./editStylingFolderHandler";

/**
 * An action to set the font size of a note
 */
export const setFontSizeAction = createContextAction({
    name: "Set note font size",
    contextItem: {
        icon: "edit",
        name: "Set font size",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 8],
        content: (
            <>
                Sets the font size of the note, "inherit" can be specified to inherit a
                default value.
            </>
        ),
    },
    folder: editStylingFolderHandler,
    core: (fields: IField<number | IInherit>[]) => {
        const execute = async ({context}: IExecuteArg) => {
            // Obtain the most frequent selection amongst notes as the default
            const defaultFontSize =
                groupBy(
                    fields.map(field => field.get()),
                    v => v
                ).reduce(
                    (best, {key, values}) =>
                        values.length > best.count
                            ? {count: values.length, fontSize: key}
                            : best,
                    {count: 0, fontSize: undefined}
                ).fontSize || "inherit";

            // Execute the select handler
            const choiceField = new Field<number | IInherit>(defaultFontSize);
            await executeAction.execute(context, [
                {
                    actionBindings: [
                        inputExecuteHandler.createBinding<number | IInherit>({
                            field: choiceField,
                            undoable: false,
                            serialize: number => number.toString(),
                            deserialize: text => (text == inherit ? text : Number(text)),
                            checkValidity: text => {
                                if (text == inherit) return;
                                const numberError = checkTextNumberConstraints(text, {
                                    min: 0,
                                    max: 40,
                                });
                                if (numberError && "message" in numberError)
                                    return {
                                        ...numberError,
                                        message: `${numberError.message} or inherit`,
                                    };

                                return numberError;
                            },
                        }),
                    ],
                },
            ]);

            // Use the result to create a set category command
            return new CompoundCommand(
                {name: "Set note font size"},
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
