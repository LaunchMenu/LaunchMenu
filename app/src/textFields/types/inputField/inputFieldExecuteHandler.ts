import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../menus/actions/Action";
import {IInputFieldExecuteData} from "./_types/IInputFieldExecuteData";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {openUI} from "../../../context/openUI/openUI";
import {InputField} from "./InputField";
import {mergeKeyListeners} from "../../../stacks/keyHandlerStack/mergeKeyListeners";
import {createTextFieldKeyHandler} from "../../interaction/keyHandler.ts/createTextFieldKeyHandler";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {TReplace} from "../../../_types/TReplace";
import {IActionCore} from "../../../menus/actions/_types/IActionCore";

/**
 * A handler to let users alter a field
 */
export const inputFieldExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IInputFieldExecuteData<unknown>[]) => ({
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
) as TReplace<
    // Cast to get improved error checking with template parameter
    IAction<IInputFieldExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T, K>(
            handlerCore: IActionCore<T, IInputFieldExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IInputFieldExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T, K>(
            handlerCore: IActionCore<T, IActionMultiResult<IInputFieldExecuteData<K>>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<IInputFieldExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: IInputFieldExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<IInputFieldExecuteData<T>>;
    }
>;
