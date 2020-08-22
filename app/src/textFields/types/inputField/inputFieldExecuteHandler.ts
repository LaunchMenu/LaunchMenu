import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../menus/actions/Action";
import {IInputFieldExecuteData} from "./_types/IInputFieldExecuteData";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {openUI} from "../../../context/openUI/openUI";
import {InputField} from "./InputField";
import {mergeKeyListeners} from "../../../stacks/keyHandlerStack/mergeKeyListeners";
import {createTextFieldKeyHandler} from "../../interaction/keyHandler.ts/createTextFieldKeyHandler";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";

/**
 * A handler to let users alter a field
 */
export const inputFieldExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IInputFieldExecuteData<any>[]) => ({
        [results]: data.map(
            ({field: fieldGetter, config, highlighter, context, undoable}) => ({
                execute: () =>
                    new Promise<ICommand | void>(res => {
                        // Retrieve the input field
                        const field =
                            fieldGetter instanceof Function ? fieldGetter() : fieldGetter;
                        let inputField = new InputField(field, context, config as any);

                        // Create UI on close handler
                        let saved = false;
                        const onClose = () => {
                            if (saved) {
                                if (undoable) {
                                    if (!inputField.getError()) {
                                        res(
                                            new SetFieldCommand(
                                                field,
                                                inputField.getValue()
                                            )
                                        );
                                        return;
                                    }
                                } else inputField.updateField();
                            }
                            res();
                        };

                        // Open the field
                        const closeUI = openUI(
                            context,
                            {
                                field: inputField,
                                // TODO: add field with input styling
                                fieldHandler: mergeKeyListeners(
                                    createTextFieldKeyHandler(inputField, false, () =>
                                        closeUI?.()
                                    ),
                                    key => {
                                        // Commit changes on enter
                                        if (key.is("enter")) {
                                            saved = true;
                                            closeUI();
                                            return true;
                                        }
                                    }
                                ),
                                highlighter: inputField.getHighlighterWithError(
                                    highlighter
                                ),
                            },
                            onClose
                        );
                    }),
            })
        ),
    })
);
