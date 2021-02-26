import React from "react";
import {
    createAction,
    createAdvancedTextFieldKeyHandler,
    editExecuteHandler,
    EditorField,
    FadeCloseTransition,
    FadeOpenTransition,
    InstantCloseTransition,
    InstantOpenTransition,
    ITextField,
    Loader,
    SetFieldCommand,
    TextField,
    UILayer,
} from "@launchmenu/core";
import {Note} from "../../dataModel/Note";
import {settings} from "../../settings";
import {Field} from "model-react";

/** An execute handler to start editing a given note's content */
export const editNoteExecuteAction = createAction({
    name: "Edit note",
    parents: [editExecuteHandler],
    core: (notes: Note[]) => ({
        children: notes.map(note =>
            editExecuteHandler.createBinding(async ({context}) => {
                const editingSettings = context.settings.get(settings).editing;

                const revertValue = note.getText();

                // Create a field to edit
                let field: ITextField;
                if (editingSettings.liveUpdate.get()) {
                    const textSelection = new Field({start: 0, end: 0});
                    field = {
                        get: h => note.getText(h),
                        set: text => note.setText(text),
                        getSelection: h => textSelection.get(h),
                        setSelection: sel => textSelection.set(sel),
                    };
                } else {
                    field = new TextField(revertValue);
                }

                // Edit the field
                await new Promise<void>(res => {
                    context.open(
                        new UILayer(
                            (context, close) => ({
                                contentHandler: createAdvancedTextFieldKeyHandler(
                                    field,
                                    context,
                                    {onExit: close}
                                ),
                                fieldView: {close: true},
                                menuView: editingSettings.fullScreenEdit.get()
                                    ? {close: true}
                                    : undefined,
                                contentView: {
                                    view: (
                                        <Loader>
                                            {h => (
                                                <EditorField
                                                    field={field}
                                                    options={{
                                                        fontSize: note.getFontSize(h),
                                                        mode: `ace/mode/${note
                                                            .getSyntaxMode(h)
                                                            .toLowerCase()}`,
                                                    }}
                                                />
                                            )}
                                        </Loader>
                                    ),
                                    transitions: {
                                        Open: FadeOpenTransition,
                                        Close: FadeCloseTransition,
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
                    field.get(),
                    revertValue
                );
            })
        ),
    }),
});
