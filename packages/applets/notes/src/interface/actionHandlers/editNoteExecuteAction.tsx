import React from "react";
import {
    createAction,
    createTextFieldKeyHandler,
    editExecuteHandler,
    EditorField,
    InstantCloseTransition,
    InstantOpenTransition,
    SetFieldCommand,
    TextField,
    UILayer,
} from "@launchmenu/core";
import {Note} from "../../dataModel/Note";

/** An execute handler to start editing a given note's content */
export const editNoteExecuteAction = createAction({
    name: "Edit note",
    parents: [editExecuteHandler],
    core: (notes: Note[]) => ({
        children: notes.map(note =>
            editExecuteHandler.createBinding(async ({context}) => {
                // Create a field to edit
                const field = new TextField(note.getText());
                await new Promise<void>(res => {
                    context.open(
                        new UILayer(
                            (context, close) => ({
                                contentHandler: createTextFieldKeyHandler(
                                    field,
                                    context,
                                    close,
                                    true
                                ),
                                fieldView: {close: true},
                                contentView: {
                                    view: <EditorField field={field} />,
                                    transitions: {
                                        Open: InstantOpenTransition,
                                        Close: InstantCloseTransition,
                                    },
                                },
                                onClose: res,
                            }),
                            {path: note.getName()}
                        )
                    );
                });

                // Create a command that updates the note's content
                return new SetFieldCommand(
                    {
                        get: h => note.getText(h),
                        set: text => note.setText(text),
                    },
                    field.get()
                );
            })
        ),
    }),
});
