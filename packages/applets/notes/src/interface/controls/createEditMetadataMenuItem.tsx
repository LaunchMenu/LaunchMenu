import {
    createAdvancedTextFieldKeyHandler,
    createStandardMenuItem,
    editExecuteHandler,
    EditorField,
    getControlsCategory,
    IMenuItem,
    SetFieldCommand,
    TextField,
    UILayer,
} from "@launchmenu/core";
import React from "react";
import {Loader} from "model-react";
import {NotesSource} from "../../dataModel/NotesSource";
import {settings} from "../../settings";
import {noteMetadataSchema} from "../../dataModel/noteMetadataSchema";
import {Infer} from "zod/lib/src/types/base";

/**
 * Creates a menu item to edit the metadata file that stores all notes
 * @param notesSource The notes source to be altered
 * @returns The menu item that can be used to alter notes metadata
 */
export function createEditMetadataMenuItem(notesSource: NotesSource): IMenuItem {
    return createStandardMenuItem({
        name: "Edit notes source file",
        category: getControlsCategory(),
        actionBindings: [
            editExecuteHandler.createBinding(async ({context}) => {
                const editingSettings = context.settings.get(settings).editing;
                const metadataFile = notesSource.getFile();

                // Create a field to edit
                const field = new TextField(
                    JSON.stringify(
                        {
                            notes: metadataFile.fields.notes.get(),
                            categories: metadataFile.fields.categories.get(),
                        },
                        null,
                        4
                    )
                );

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
                                                        fontSize: 14,
                                                        mode: `ace/mode/json`,
                                                    }}
                                                />
                                            )}
                                        </Loader>
                                    ),
                                },
                                onClose: res,
                            }),
                            {path: "Notes metadata"}
                        )
                    );
                });

                // Convert the result to json, and check it adheres to the schema
                let json: Infer<typeof noteMetadataSchema>;
                try {
                    json = JSON.parse(field.get());
                    noteMetadataSchema.parse(json);
                } catch (e) {
                    console.error(e);
                    return; // TODO: add notification/ allow user to continue editing, same applies to all other returns
                }

                // Create a command that updates the note's content
                return new SetFieldCommand(
                    {
                        get: h => ({
                            notes: metadataFile.fields.notes.get(h),
                            categories: metadataFile.fields.categories.get(h),
                        }),
                        set: ({categories, notes}) => {
                            metadataFile.fields.notes.set(notes);
                            metadataFile.fields.categories.set(categories);
                        },
                    },
                    json
                );
            }),
        ],
    });
}
